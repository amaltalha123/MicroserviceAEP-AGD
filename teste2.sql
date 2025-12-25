-- ============================================
-- MICROSERVICE: ÉCLAIRAGE PUBLIC & DÉCHETS
-- Base de données pour traitement des réclamations
--équipes automatiques
-- ============================================

-- Types énumérés
CREATE TYPE service_type AS ENUM ('lighting', 'waste');

CREATE TYPE claim_status AS ENUM (
    'submitted',      -- Initial state
    'received',       -- Service acknowledged
    'assigned',       -- Assigned to operator
    'in_progress',    -- Being worked on
    'pending_info',   -- Waiting for user info
    'resolved',       -- Service completed work
    'closed',         -- Claim closed
    'rejected'        -- Claim rejected
);

CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE employee_status AS ENUM ('available', 'unavailable');



-- ============================================
-- TABLE PRINCIPALE: RÉCLAMATIONS
-- ============================================
CREATE TABLE claims (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Référence depuis le portail
    portal_claim_id         UUID NOT NULL UNIQUE,
    claim_number            VARCHAR(20) NOT NULL,
    
    -- Type de service 
    service_type            service_type NOT NULL,
    
    -- Informations utilisateur (depuis Kafka)
    user_id                 VARCHAR(255) NOT NULL,
    user_email              VARCHAR(255) NOT NULL,
    user_name               VARCHAR(255),
    user_phone              VARCHAR(50),
    
    -- Détails réclamation
    title                   VARCHAR(500) NOT NULL,
    description             TEXT NOT NULL,
    
    -- Localisation (OBLIGATOIRE)
    location_address        TEXT NOT NULL,
    location_lat            DECIMAL(10, 8) NOT NULL,
    location_lng            DECIMAL(11, 8) NOT NULL,
    
    -- Priorité et délai
    priority                priority_level NOT NULL DEFAULT 'medium',
    estimated_resolution_hours INTEGER,
    
    -- Date d'intervention calculée
    intervention_scheduled_date DATE,
    
    -- Données spécifiques service (depuis extraData du portail)
    service_specific_data   JSONB DEFAULT '{}',
    
    -- Statut
    status                  claim_status DEFAULT 'received',
    
    -- Équipe assignée (ID de l'équipe créée automatiquement)
    assigned_team_id        UUID,
    
    -- Chef d'équipe
    team_leader_id          UUID,
    
    -- Référence interne
    internal_ticket_number  VARCHAR(50) UNIQUE,
    
    -- Résolution (rempli par le chef d'équipe)
    resolution_description  TEXT,
    resolution_submitted_at TIMESTAMP WITH TIME ZONE,
    resolution_submitted_by UUID,                           -- ID du chef qui a soumis
    
    -- Timestamps
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    team_assigned_at        TIMESTAMP WITH TIME ZONE,
    resolved_at             TIMESTAMP WITH TIME ZONE,
    
    -- Kafka tracking
    last_kafka_message_id   VARCHAR(255)
);

-- ============================================
-- TABLE: EMPLOYÉS
-- ============================================
CREATE TABLE employees (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identité
    employee_number         VARCHAR(50) UNIQUE NOT NULL,    -- Matricule
    clerk_user_id           VARCHAR(255) UNIQUE,            -- ID Clerk si l'employé a un compte
    
    full_name               VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(50),
    
    -- Service
    service_type            service_type NOT NULL,          -- lighting ou waste
    
    -- Statut de disponibilité
    status                  employee_status DEFAULT 'available',
    
    -- Statistiques
    total_interventions     INTEGER DEFAULT 0,
    current_active_claims   INTEGER DEFAULT 0,
    
    is_active               BOOLEAN DEFAULT true,           -- Employé actif ou archivé
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    
);

--Index
CREATE INDEX idx_employees_service
ON employees (service_type);

CREATE INDEX idx_employees_status
ON employees (status);

CREATE INDEX idx_employees_service_status
ON employees (service_type, status);

-- ============================================
-- TABLE: ÉQUIPES D'INTERVENTION
-- ============================================
CREATE TABLE intervention_teams (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id                UUID NOT NULL UNIQUE REFERENCES claims(id) ON DELETE CASCADE,
    
    service_type            service_type NOT NULL,
    
    -- Chef d'équipe
    team_leader_id          UUID NOT NULL REFERENCES employees(id),
    
    -- Token unique pour le formulaire de résolution
    resolution_token        VARCHAR(255) UNIQUE NOT NULL,   -- UUID pour le lien email
    resolution_token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Statut de l'équipe
    is_active               BOOLEAN DEFAULT true,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at            TIMESTAMP WITH TIME ZONE
    
);
  -- Index
CREATE INDEX idx_teams_claim
ON intervention_teams (claim_id);
CREATE INDEX idx_teams_leader
ON intervention_teams (team_leader_id);
CREATE INDEX idx_teams_token
ON intervention_teams (resolution_token);

-- ============================================
-- TABLE: MEMBRES D'ÉQUIPE
-- ============================================
CREATE TABLE team_members (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id                 UUID NOT NULL REFERENCES intervention_teams(id) ON DELETE CASCADE,
    employee_id             UUID NOT NULL REFERENCES employees(id),
    
    is_leader               BOOLEAN DEFAULT false,
    
    -- Notifications
    notification_sent       BOOLEAN DEFAULT false,
    notification_sent_at    TIMESTAMP WITH TIME ZONE,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
   
    
    -- Contrainte: un employé ne peut être qu'une fois dans une équipe
    UNIQUE(team_id, employee_id)
);
--Index
CREATE INDEX idx_team_members_team
ON team_members (team_id);
CREATE INDEX idx_team_members_employee
ON team_members (employee_id);
-- ============================================
-- TABLE: PHOTOS RÉCLAMATION
-- ============================================
CREATE TABLE claim_photos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id                UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Type de photo
    file_type              VARCHAR(50) NOT NULL,           -- 'initial' (client) ou 'resolution' (chef équipe)
    
    -- Fichier
    file_url                TEXT NOT NULL,
    file_name               VARCHAR(255),
    file_size               INTEGER,
    
    -- Qui a uploadé
    uploaded_by             VARCHAR(255),                   -- user_id ou employee_id
    uploaded_by_type        VARCHAR(20),                    -- 'client' ou 'employee'
    
    -- Metadata
    description             TEXT,
    
    uploaded_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
   
);
--
CREATE INDEX idx_photos_claim
ON claim_photos (claim_id);

CREATE INDEX iidx_photos_type
ON claim_photos (file_type);
-- ============================================
-- TABLE: HISTORIQUE DES ACTIONS
-- ============================================
CREATE TABLE claim_actions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id                UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    -- Action
    action_type             VARCHAR(100) NOT NULL,          -- 'received', 'team_created', 'in_progress', 'resolved', 'status_change'
    action_description      TEXT NOT NULL,
    
    -- Acteur
    performed_by            VARCHAR(255),                   -- system, employee_id, user_id
    performed_by_type       VARCHAR(20),                    -- 'system', 'employee', 'client'
    performed_by_name       VARCHAR(255),
    
    -- Changement de statut
    previous_status         claim_status,
    new_status              claim_status,
    
    -- Données additionnelles
    action_data             JSONB DEFAULT '{}',
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    -- Index
    
);
CREATE INDEX idx_actions_claim
ON claim_actions (claim_id);

CREATE INDEX idx_actions_date
ON claim_actions (created_at DESC);
-- ============================================
-- TABLE: LOG KAFKA
-- ============================================
CREATE TABLE kafka_messages_log (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id                UUID REFERENCES claims(id) ON DELETE CASCADE,
    
    kafka_message_id        VARCHAR(255) NOT NULL,
    kafka_topic             VARCHAR(255) NOT NULL,
    message_type            VARCHAR(100) NOT NULL,          -- CLAIM_CREATED, STATUS_UPDATE, etc.
    
    payload                 JSONB NOT NULL,
    
    direction               VARCHAR(10) NOT NULL,           -- 'inbound' ou 'outbound'
    
    processed               BOOLEAN DEFAULT false,
    processed_at            TIMESTAMP WITH TIME ZONE,
    error_message           TEXT,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kafka_claim
ON kafka_messages_log (claim_id);

CREATE INDEX idx_kafka_processed
ON kafka_messages_log (processed, created_at);
-- ============================================
-- TABLE: NOTIFICATIONS EMAILS
-- ============================================
CREATE TABLE email_notifications (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id                UUID REFERENCES claims(id) ON DELETE CASCADE,
    team_id                 UUID REFERENCES intervention_teams(id) ON DELETE CASCADE,
    
    recipient_email         VARCHAR(255) NOT NULL,
    recipient_name          VARCHAR(255),
    recipient_type          VARCHAR(50),                    -- 'team_leader', 'team_member'
    
    email_type              VARCHAR(100) NOT NULL,          -- 'team_assignment', 'resolution_reminder'
    subject                 VARCHAR(500) NOT NULL,
    
    -- Contenu
    email_body_html         TEXT,
    
    -- Lien de résolution (pour chef d'équipe)
    resolution_link         TEXT,
    
    -- Statut d'envoi
    sent                    BOOLEAN DEFAULT false,
    sent_at                 TIMESTAMP WITH TIME ZONE,
    error_message           TEXT,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emails_claim 
ON email_notifications (claim_id);

CREATE INDEX idx_emails_sent 
ON email_notifications (sent, created_at);
-- ============================================
-- INDEXES SUPPLÉMENTAIRES
-- ============================================
CREATE INDEX idx_claims_portal_id ON claims(portal_claim_id);
CREATE INDEX idx_claims_service_type ON claims(service_type);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_priority ON claims(priority);
CREATE INDEX idx_claims_scheduled_date ON claims(intervention_scheduled_date);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX idx_claims_internal_ticket ON claims(internal_ticket_number);

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
-- ============================================
-- FONCTION: GÉNÉRATION NUMÉRO DE TICKET
-- ============================================
CREATE OR REPLACE FUNCTION generate_internal_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(5);
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    prefix := CASE NEW.service_type
        WHEN 'lighting' THEN 'LGT'
        WHEN 'waste' THEN 'WST'
    END;
    
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(internal_ticket_number FROM 11) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM claims
    WHERE service_type = NEW.service_type
      AND internal_ticket_number LIKE prefix || '-' || year_part || '-%';
    
    NEW.internal_ticket_number := prefix || '-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON claims
    FOR EACH ROW
    EXECUTE FUNCTION generate_internal_ticket_number();

-- ============================================
-- FONCTION: MISE À JOUR TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claims_timestamp
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_employees_timestamp
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FONCTION: CALCUL DATE D'INTERVENTION
-- ============================================
CREATE OR REPLACE FUNCTION calculate_intervention_date(
    p_priority priority_level
) RETURNS DATE AS $$
BEGIN
    RETURN CASE p_priority
        WHEN 'urgent' THEN CURRENT_DATE                    -- Aujourd'hui
        WHEN 'high' THEN CURRENT_DATE + INTERVAL '1 day'   -- Demain
        WHEN 'medium' THEN CURRENT_DATE + INTERVAL '3 days' -- Dans 3 jours
        WHEN 'low' THEN CURRENT_DATE + INTERVAL '7 days'   -- Dans 7 jours
    END;
END;
$$ LANGUAGE plpgsql;

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
-- FONCTION: LIBÉRER L'ÉQUIPE APRÈS RÉSOLUTION
-- ============================================
CREATE OR REPLACE FUNCTION release_team_after_resolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la réclamation passe à 'resolved'
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        -- Remettre tous les membres de l'équipe en disponible
        UPDATE employees
        SET status = 'available',
            current_active_claims = GREATEST(current_active_claims - 1, 0),
            total_interventions = total_interventions + 1
        WHERE id IN (
            SELECT tm.employee_id
            FROM team_members tm
            JOIN intervention_teams it ON tm.team_id = it.id
            WHERE it.claim_id = NEW.id
        );
        
        -- Marquer l'équipe comme terminée
        UPDATE intervention_teams
        SET is_active = false,
            completed_at = NOW()
        WHERE claim_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_release_team
    AFTER UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION release_team_after_resolution();

-- ============================================
-- fonction:  verifie l existance d un team
-- ============================================
CREATE OR REPLACE FUNCTION can_create_new_team(
    p_service service_type
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM employees
    WHERE service_type = p_service
      AND status = 'available'
      AND is_active = true;

    RETURN v_count >= 3;
END;
$$;

-- ============================================
--Ajouter trigger pour définir automatiquement requires_supervisor_validation
-- ============================================

CREATE OR REPLACE FUNCTION set_supervisor_requirement()
RETURNS TRIGGER AS $$
BEGIN
    -- Éclairage nécessite validation superviseur, Déchets non
    NEW.requires_supervisor_validation := (NEW.service_type = 'lighting');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_supervisor_requirement
    BEFORE INSERT ON claims
    FOR EACH ROW
    EXECUTE FUNCTION set_supervisor_requirement();

-- ============================================
-- FONCTION: VALIDATION PAR LE SUPERVISEUR (uniquement éclairage)
-- ============================================
CREATE OR REPLACE FUNCTION validate_claim_by_supervisor(
    p_claim_id UUID
   
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;



-- ============================================
-- FONCTION: CLÔTURE DIRECTE (pour déchets)
-- ============================================
CREATE OR REPLACE FUNCTION close_claim_by_leader(
    p_claim_id UUID,
    p_leader_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_service_type service_type;
    v_is_leader BOOLEAN;
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
    
    -- Vérifier que l'employé est bien le leader
    SELECT EXISTS(
        SELECT 1
        FROM team_members tm
        JOIN intervention_teams it ON tm.team_id = it.id
        WHERE it.claim_id = p_claim_id
          AND tm.employee_id = p_leader_id
          AND tm.is_leader = true
    ) INTO v_is_leader;
    
    IF NOT v_is_leader THEN
        RAISE EXCEPTION 'Cet employé n''est pas le chef d''équipe de cette réclamation';
    END IF;
    
    -- Clôturer directement
    UPDATE claims
    SET status = 'closed',
        updated_at = NOW()
    WHERE id = p_claim_id;
    
    -- Logger l'action
    INSERT INTO claim_actions (
        claim_id,
        action_type,
        action_description,
        performed_by,
        performed_by_type,
        performed_by_name,
        previous_status,
        new_status
    )
    SELECT 
        p_claim_id,
        'direct_closure',
        'Clôture directe par le chef d''équipe',
        p_leader_id::TEXT,
        'employee',
        e.full_name,
        v_current_status,
        'closed'
    FROM employees e
    WHERE e.id = p_leader_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- VUE: RÉCLAMATIONS AVEC DÉTAILS
-- ============================================
CREATE VIEW claims_detailed AS
SELECT 
    c.id,
    c.claim_number,
    c.internal_ticket_number,
    c.service_type,
    c.title,
    c.description,
    c.status,
    c.priority,
    c.location_address,
    c.intervention_scheduled_date,
    c.created_at,
    c.team_assigned_at,
    c.resolved_at,
    
    -- Chef d'équipe
    e.full_name as team_leader_name,
    e.email as team_leader_email,
    
    -- Compteurs
    (SELECT COUNT(*) FROM team_members tm 
     JOIN intervention_teams it ON tm.team_id = it.id 
     WHERE it.claim_id = c.id) as team_size,
    
    (SELECT COUNT(*) FROM claim_photos cp 
     WHERE cp.claim_id = c.id AND cp.file_type = 'initial') as initial_photos_count,
    
    (SELECT COUNT(*) FROM claim_photos cp 
     WHERE cp.claim_id = c.id AND cp.file_type = 'resolution') as resolution_photos_count
    
FROM claims c
LEFT JOIN employees e ON c.team_leader_id = e.id;

-- ============================================
-- VUE: STATISTIQUES EMPLOYÉS
-- ============================================
CREATE VIEW employee_statistics AS
SELECT 
    e.id,
    e.employee_number,
    e.full_name,
    e.email,
    e.service_type,
    e.status,
    e.current_active_claims,
    e.total_interventions,
    
    -- Nombre de fois chef d'équipe
    (SELECT COUNT(*) 
     FROM intervention_teams it 
     WHERE it.team_leader_id = e.id) as times_as_leader,
    
    -- Taux de résolution (interventions terminées / total)
    CASE 
        WHEN e.total_interventions > 0 
        THEN ROUND(
            (SELECT COUNT(*) FROM team_members tm
             JOIN intervention_teams it ON tm.team_id = it.id
             JOIN claims c ON it.claim_id = c.id
             WHERE tm.employee_id = e.id AND c.status = 'resolved')::NUMERIC 
            / e.total_interventions * 100, 2
        )
        ELSE 0
    END as resolution_rate_percentage
    
FROM employees e
WHERE e.is_active = true;

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
-- DONNÉES INITIALES: EMPLOYÉS EXEMPLES
-- ============================================
INSERT INTO employees (employee_number, full_name, email, phone, service_type) VALUES
    -- Éclairage
    ('EMP-LGT-001', 'Ahmed Alami', 'ahmed.alami@smartcity.ma', '+212600111111', 'lighting'),
    ('EMP-LGT-002', 'Fatima Benali', 'fatima.benali@smartcity.ma', '+212600222222', 'lighting'),
    ('EMP-LGT-003', 'Youssef Tazi', 'youssef.tazi@smartcity.ma', '+212600333333', 'lighting'),
    ('EMP-LGT-004', 'Hanane Idrissi', 'hanane.idrissi@smartcity.ma', '+212600444444', 'lighting'),
    ('EMP-LGT-005', 'Karim Benjelloun', 'karim.benjelloun@smartcity.ma', '+212600555555', 'lighting'),
    
    -- Déchets
    ('EMP-WST-001', 'Mohammed Fassi', 'mohammed.fassi@smartcity.ma', '+212600666666', 'waste'),
    ('EMP-WST-002', 'Salma Rachidi', 'salma.rachidi@smartcity.ma', '+212600777777', 'waste'),
    ('EMP-WST-003', 'Omar Kettani', 'omar.kettani@smartcity.ma', '+212600888888', 'waste'),
    ('EMP-WST-004', 'Zineb Lazrak', 'zineb.lazrak@smartcity.ma', '+212600999999', 'waste'),
    ('EMP-WST-005', 'Amine Berrada', 'amine.berrada@smartcity.ma', '+212600000000', 'waste');