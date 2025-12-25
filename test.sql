-- ============================================
-- MODIFICATIONS POUR VALIDATION SUPERVISEUR
-- Différenciation Éclairage (avec superviseur) vs Déchets (sans superviseur)
-- ============================================

-- 1. Ajouter colonne superviseur dans intervention_teams
ALTER TABLE intervention_teams 
ADD COLUMN team_supervisor_id UUID REFERENCES employees(id);

-- 2. Ajouter colonne is_supervisor dans team_members
ALTER TABLE team_members 
ADD COLUMN is_supervisor BOOLEAN DEFAULT false;

-- 3. Ajouter colonne pour identifier le type de validation requis
ALTER TABLE claims 
ADD COLUMN requires_supervisor_validation BOOLEAN DEFAULT false;

-- 4. Créer index pour les requêtes de validation
CREATE INDEX idx_claims_supervisor_validation 
ON claims(requires_supervisor_validation) 
WHERE requires_supervisor_validation = true;

-- 5. Ajouter trigger pour définir automatiquement requires_supervisor_validation
CREATE OR REPLACE FUNCTION set_supervisor_requirement()
RETURNS TRIGGER AS $$
BEGIN
    -- Éclairage nécessite validation superviseur, Déchets non
    NEW.requires_supervisor_validation := (NEW.service_type = 'lighting');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_supervisor_requirement
    BEFORE INSERT ON claims
    FOR EACH ROW
    EXECUTE FUNCTION set_supervisor_requirement();

-- ============================================
-- MODIFIER LA FONCTION DE CRÉATION D'ÉQUIPE
-- Pour assigner un superviseur uniquement pour l'éclairage
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_intervention_team(
    p_claim_id UUID,
    p_service_type service_type
) RETURNS UUID AS $$
DECLARE
    v_team_id UUID;
    v_team_leader_id UUID;
    v_team_supervisor_id UUID;
    v_resolution_token VARCHAR(255);
    v_employee RECORD;
    v_count INTEGER := 0;
    v_team_size INTEGER;
BEGIN
    -- Déterminer la taille de l'équipe selon le service
    -- Éclairage: 3 membres + 1 superviseur = 4 personnes
    -- Déchets: 3 membres seulement
    v_team_size := CASE 
        WHEN p_service_type = 'lighting' THEN 4 
        ELSE 3 
    END;
    
    -- Vérifier qu'on a assez d'employés disponibles
    IF (SELECT COUNT(*) FROM employees 
        WHERE service_type = p_service_type 
        AND status = 'available' 
        AND is_active = true) < v_team_size THEN
        RAISE EXCEPTION 'Pas assez d''employés disponibles pour le service %', p_service_type;
    END IF;
    
    -- Générer un token unique pour le formulaire de résolution
    v_resolution_token := gen_random_uuid()::TEXT;
    
    -- Créer l'équipe (temporairement sans chef ni superviseur)
    INSERT INTO intervention_teams (
        claim_id, 
        service_type, 
        team_leader_id,
        team_supervisor_id,
        resolution_token,
        resolution_token_expires_at
    )
    SELECT 
        p_claim_id,
        p_service_type,
        (SELECT id FROM employees WHERE service_type = p_service_type AND status = 'available' LIMIT 1), -- temporaire
        NULL, -- sera défini après si nécessaire
        v_resolution_token,
        NOW() + INTERVAL '30 days'
    RETURNING id INTO v_team_id;
    
    -- Pour l'éclairage: sélectionner 3 membres + 1 superviseur (4 personnes)
    -- Pour déchets: sélectionner 3 membres seulement
    IF p_service_type = 'lighting' THEN
        -- ÉCLAIRAGE: Sélectionner le superviseur en premier (l'employé le plus expérimenté)
        SELECT id INTO v_team_supervisor_id
        FROM employees
        WHERE service_type = p_service_type 
          AND status = 'available'
          AND is_active = true
        ORDER BY 
            total_interventions DESC,  -- Le plus expérimenté
            created_at ASC
        LIMIT 1;
        
        -- Mettre à jour l'équipe avec le superviseur
        UPDATE intervention_teams
        SET team_supervisor_id = v_team_supervisor_id
        WHERE id = v_team_id;
        
        -- Ajouter le superviseur à team_members
        INSERT INTO team_members (team_id, employee_id, is_leader, is_supervisor)
        VALUES (v_team_id, v_team_supervisor_id, false, true);
        
        -- Marquer le superviseur comme non disponible
        UPDATE employees
        SET status = 'unavailable',
            current_active_claims = current_active_claims + 1
        WHERE id = v_team_supervisor_id;
        
        -- Ensuite, sélectionner les 3 membres de l'équipe (excluant le superviseur)
        FOR v_employee IN (
            SELECT id, full_name
            FROM employees
            WHERE service_type = p_service_type 
              AND status = 'available'
              AND is_active = true
              AND id != v_team_supervisor_id  -- Exclure le superviseur
            ORDER BY 
                total_interventions ASC,
                created_at ASC
            LIMIT 3
        ) LOOP
            v_count := v_count + 1;
            
            -- Le premier devient chef d'équipe
            IF v_count = 1 THEN
                v_team_leader_id := v_employee.id;
                
                UPDATE intervention_teams
                SET team_leader_id = v_team_leader_id
                WHERE id = v_team_id;
                
                UPDATE claims
                SET team_leader_id = v_team_leader_id,
                    assigned_team_id = v_team_id
                WHERE id = p_claim_id;
            END IF;
            
            -- Ajouter le membre
            INSERT INTO team_members (team_id, employee_id, is_leader, is_supervisor)
            VALUES (v_team_id, v_employee.id, v_count = 1, false);
            
            -- Marquer comme non disponible
            UPDATE employees
            SET status = 'unavailable',
                current_active_claims = current_active_claims + 1
            WHERE id = v_employee.id;
        END LOOP;
        
    ELSE
        -- DÉCHETS: Sélectionner 3 membres seulement (pas de superviseur)
        FOR v_employee IN (
            SELECT id, full_name
            FROM employees
            WHERE service_type = p_service_type 
              AND status = 'available'
              AND is_active = true
            ORDER BY 
                total_interventions ASC,
                created_at ASC
            LIMIT 3
        ) LOOP
            v_count := v_count + 1;
            
            -- Le premier devient chef d'équipe
            IF v_count = 1 THEN
                v_team_leader_id := v_employee.id;
                
                UPDATE intervention_teams
                SET team_leader_id = v_team_leader_id
                WHERE id = v_team_id;
                
                UPDATE claims
                SET team_leader_id = v_team_leader_id,
                    assigned_team_id = v_team_id
                WHERE id = p_claim_id;
            END IF;
            
            -- Ajouter le membre
            INSERT INTO team_members (team_id, employee_id, is_leader, is_supervisor)
            VALUES (v_team_id, v_employee.id, v_count = 1, false);
            
            -- Marquer comme non disponible
            UPDATE employees
            SET status = 'unavailable',
                current_active_claims = current_active_claims + 1
            WHERE id = v_employee.id;
        END LOOP;
    END IF;
    
    -- Vérifier qu'on a bien créé l'équipe complète
    IF v_count < 3 THEN
        RAISE EXCEPTION 'Erreur lors de la création de l''équipe (% membre(s) créé(s), 3 requis)', v_count;
    END IF;
    
    RETURN v_team_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION: VALIDATION PAR LE SUPERVISEUR (uniquement éclairage)
-- ============================================
CREATE OR REPLACE FUNCTION validate_claim_by_supervisor(
    p_claim_id UUID
   
) RETURNS BOOLEAN AS $
DECLARE
    v_service_type service_type;
    v_is_supervisor BOOLEAN;
    v_current_status claim_status;
BEGIN
    -- Récupérer le type de service et le statut actuel
    SELECT service_type, status 
    INTO v_service_type, v_current_status
    FROM claims
    WHERE id = p_claim_id;
    
    -- Vérifier que c'est une réclamation d'éclairage
    IF v_service_type != 'lighting' THEN
        RAISE EXCEPTION 'Cette réclamation ne nécessite pas de validation superviseur';
    END IF;
    
    -- Vérifier que l'employé est bien le superviseur de cette équipe
    
    
    -- Clôturer la réclamation
    UPDATE claims
    SET status = 'closed',
        updated_at = NOW()
    WHERE id = p_claim_id;
    
    -- Logger l'action
    
    RETURN true;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION: CLÔTURE DIRECTE (pour déchets)
-- ============================================
CREATE OR REPLACE FUNCTION close_claim_by_leader(
    p_claim_id UUID
) RETURNS BOOLEAN AS $
DECLARE
    v_service_type service_type;
    v_current_status claim_status;
BEGIN
    -- Récupérer le type de service et le statut actuel
    SELECT service_type, status 
    INTO v_service_type, v_current_status
    FROM claims
    WHERE id = p_claim_id;
    
    -- Vérifier que c'est une réclamation de déchets
    IF v_service_type != 'waste' THEN
        RAISE EXCEPTION 'Cette réclamation nécessite une validation superviseur';
    END IF;
    
    -- Clôturer directement
    UPDATE claims
    SET status = 'closed',
        updated_at = NOW()
    WHERE id = p_claim_id;
    
    -- Logger l'action
    
    RETURN true;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- METTRE À JOUR LA VUE active_teams
-- ============================================
DROP VIEW IF EXISTS active_teams;

CREATE VIEW active_teams AS
SELECT 
    it.id as team_id,
    it.claim_id,
    c.claim_number,
    c.internal_ticket_number,
    c.service_type,
    c.priority,
    c.intervention_scheduled_date,
    
    -- Chef d'équipe
    leader.full_name as leader_name,
    leader.email as leader_email,
    
    -- Superviseur (uniquement pour éclairage)
    supervisor.full_name as supervisor_name,
    supervisor.email as supervisor_email,
    
    -- Validation superviseur requise
    c.requires_supervisor_validation,
    
    -- Membres (JSON)
    (SELECT json_agg(json_build_object(
        'id', e.id,
        'name', e.full_name,
        'email', e.email,
        'is_leader', tm.is_leader,
        'is_supervisor', tm.is_supervisor
    ))
    FROM team_members tm
    JOIN employees e ON tm.employee_id = e.id
    WHERE tm.team_id = it.id) as team_members,
    
    it.created_at as team_created_at
    
FROM intervention_teams it
JOIN claims c ON it.claim_id = c.id
JOIN employees leader ON it.team_leader_id = leader.id
LEFT JOIN employees supervisor ON it.team_supervisor_id = supervisor.id
WHERE it.is_active = true;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================

-- Pour tester la création d'équipe avec superviseur (éclairage):
/*
SELECT auto_create_intervention_team(
    'uuid-de-la-reclamation',
    'lighting'::service_type
);
-- Résultat: équipe de 4 personnes (3 membres + 1 superviseur)
*/

-- Pour tester la création d'équipe sans superviseur (déchets):
/*
SELECT auto_create_intervention_team(
    'uuid-de-la-reclamation',
    'waste'::service_type
);
-- Résultat: équipe de 3 personnes (3 membres seulement)
*/

-- Pour valider une réclamation d'éclairage (par superviseur):
/*
SELECT validate_claim_by_supervisor(
    'uuid-de-la-reclamation',
    'uuid-du-superviseur',
    'Intervention validée, travail conforme'
);
*/

-- Pour clôturer directement une réclamation de déchets (par leader):
/*
SELECT close_claim_by_leader(
    'uuid-de-la-reclamation',
    'uuid-du-leader'
);
*/