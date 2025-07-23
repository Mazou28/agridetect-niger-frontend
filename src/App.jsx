import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Upload, Camera, Leaf, AlertTriangle, CheckCircle, Volume2, MapPin } from 'lucide-react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('french')
  const [audioLoading, setAudioLoading] = useState(false)

  const languages = [
    { code: 'french', name: 'Français' },
    { code: 'hausa', name: 'Haoussa' },
    { code: 'zarma', name: 'Zarma' }
  ]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setPrediction(null)
    }
  }

  const handlePrediction = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)

const API_BASE_URL = 'https://mazou28-agridetect-niger-backend.hf.space';

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setPrediction(result)
      } else {
        console.error('Prediction failed')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSpeechSynthesis = async () => {
    if (!prediction) return

    setAudioLoading(true)
    
    const resultText = prediction.predicted_class === 'Healthy' 
      ? `La plante est saine avec une confiance de ${(prediction.confidence * 100).toFixed(1)} pour cent.`
      : `Maladie détectée: ${prediction.predicted_class === 'Blast' ? 'pyriculariose' : 'rouille'} avec une confiance de ${(prediction.confidence * 100).toFixed(1)} pour cent. Consultez un agronome.`

    try {
      const response = await fetch(`${API_BASE_URL}/api/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: resultText,
          language: selectedLanguage
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      } else {
        console.error('Speech synthesis failed')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setAudioLoading(false)
    }
  }

  const getStatusIcon = (predictedClass) => {
    if (predictedClass === 'Healthy') {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    } else {
      return <AlertTriangle className="w-6 h-6 text-red-500" />
    }
  }

  const getStatusColor = (predictedClass) => {
    if (predictedClass === 'Healthy') {
      return 'text-green-600'
    } else {
      return 'text-red-600'
    }
  }

  const getRecommendations = (predictedClass) => {
    if (predictedClass === 'Healthy') {
      return [
        '• Continuez les bonnes pratiques agricoles',
        '• Surveillez régulièrement vos cultures',
        '• Maintenez une bonne irrigation',
        '• Appliquez les engrais recommandés'
      ]
    } else if (predictedClass === 'Blast') {
      return [
        '• Isolez immédiatement les plants infectés',
        '• Appliquez un fongicide à base de tricyclazole',
        '• Améliorez la circulation d\'air entre les plants',
        '• Évitez l\'irrigation par aspersion le soir'
      ]
    } else if (predictedClass === 'Rust') {
      return [
        '• Retirez et détruisez les feuilles infectées',
        '• Appliquez un fongicide préventif',
        '• Espacez mieux les plants pour réduire l\'humidité',
        '• Consultez un agent agricole local'
      ]
    }
    return []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">AgriDetect Niger</h1>
          </div>
          <p className="text-lg text-gray-600">
            Détection intelligente des maladies du mil pour l'agriculture au Niger
          </p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Adapté aux conditions agricoles du Niger</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Télécharger une image
              </CardTitle>
              <CardDescription>
                Sélectionnez une photo de feuille de mil pour analyser les maladies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Cliquez pour sélectionner une image
                    </p>
                  </label>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <Button
                  onClick={handlePrediction}
                  disabled={!selectedFile || loading}
                  className="w-full"
                >
                  {loading ? 'Analyse en cours...' : 'Analyser l\'image'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Résultats de l'analyse</CardTitle>
              <CardDescription>
                Diagnostic automatique des maladies du mil
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prediction ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(prediction.predicted_class)}
                    <div>
                      <h3 className={`text-xl font-semibold ${getStatusColor(prediction.predicted_class)}`}>
                        {prediction.predicted_class === 'Healthy' ? 'Plante saine' :
                         prediction.predicted_class === 'Blast' ? 'Maladie de la pyriculariose' :
                         prediction.predicted_class === 'Rust' ? 'Maladie de la rouille' :
                         prediction.predicted_class}
                      </h3>
                      <p className="text-gray-600">
                        Confiance: {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Speech Synthesis Section */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Écouter le résultat
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleSpeechSynthesis}
                        disabled={audioLoading}
                        variant="outline"
                        size="sm"
                      >
                        {audioLoading ? 'Génération...' : 'Écouter'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Détails de l'analyse:</h4>
                      <div className="space-y-2">
                        {Object.entries(prediction.all_predictions).map(([className, confidence]) => (
                          <div key={className} className="flex justify-between">
                            <span className="text-gray-600">
                              {className === 'Healthy' ? 'Saine' :
                               className === 'Blast' ? 'Pyriculariose' :
                               className === 'Rust' ? 'Rouille' : className}
                            </span>
                            <span className="font-medium">
                              {(confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommandations:</h4>
                      <ul className="text-sm space-y-1">
                        {getRecommendations(prediction.predicted_class).map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Sélectionnez une image pour commencer l'analyse</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-700 mb-2">Cultures supportées</h3>
              <p className="text-sm text-gray-600">Mil (pearl millet) - Culture principale du Niger</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-700 mb-2">Langues disponibles</h3>
              <p className="text-sm text-gray-600">Français, Haoussa, Zarma</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-700 mb-2">Utilisation hors ligne</h3>
              <p className="text-sm text-gray-600">Fonctionne sans connexion Internet</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Développé pour l'agriculture durable au Niger</p>
          <p className="text-sm mt-1">Projet de Master 2 en Data Science</p>
        </div>
      </div>
    </div>
  )
}

export default App

