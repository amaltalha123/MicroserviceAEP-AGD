// src/pages/Resolution.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Resolution = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState({
    claimNumber: 'CLM-2024-00123',
    internalTicket: 'LGT-2024-00045',
    title: 'Lampadaire éteint Rue Mohammed V',
    location: 'Rue Mohammed V, Marrakech',
    scheduledDate: new Date('2024-12-14'),
  });

  const [formData, setFormData] = useState({
    photos: [],
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Gérer l'upload de photos
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('La photo ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file,
          }],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Supprimer une photo
  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId),
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (formData.photos.length === 0) {
      newErrors.photos = 'Au moins une photo est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre la résolution
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler l'upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Appeler l'API
      // const formDataToSend = new FormData();
      // formData.photos.forEach((photo, index) => {
      //   formDataToSend.append(`photos`, photo.file);
      // });
      // formDataToSend.append('description', formData.description);
      // await api.post(`/claims/${claim.id}/resolution`, formDataToSend);

      setIsSuccess(true);

      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      alert('Erreur lors de la soumission. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  // Si la résolution a été soumise avec succès
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Résolution soumise avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            La réclamation {claim.claimNumber} a été marquée comme résolue.
            Vous et votre équipe êtes maintenant disponibles pour de nouvelles interventions.
          </p>
          <p className="text-sm text-gray-500">
            Redirection automatique...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Résolution Réclamation</h1>
        <p className="text-sm text-gray-500">{claim.claimNumber}</p>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Infos réclamation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">{claim.title}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{claim.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Prévue le {format(claim.scheduledDate, 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload photos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Photos <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500">Après intervention (obligatoire)</p>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {formData.photos.length} / 5
              </span>
            </div>

            {/* Photos uploadées */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {formData.photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={photo.url}
                      alt="Photo intervention"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Boutons upload */}
            {formData.photos.length < 5 && (
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Prendre une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Choisir depuis la galerie</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {errors.photos && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.photos}</span>
              </div>
            )}
          </div>

          {/* Description résolution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block mb-3">
              <span className="font-semibold text-gray-900">
                Description de la résolution <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Décrivez les actions effectuées et le résultat
              </p>
            </label>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Remplacement de l'ampoule LED défectueuse par une nouvelle. Test de fonctionnement effectué avec succès. Zone nettoyée."
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {formData.description.length} caractères (min. 20)
              </span>
              {errors.description && (
                <span className="text-sm text-red-600">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Attention</p>
                <p>
                  Une fois la résolution soumise, la réclamation sera marquée comme <strong>RÉSOLUE</strong> et 
                  vous et votre équipe redeviendrez <strong>DISPONIBLES</strong> automatiquement.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer fixe avec boutons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Marquer comme Résolue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resolution;