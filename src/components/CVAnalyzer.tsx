import { useState } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function CVAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const analyzeCV = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        score: 85,
        strengths: [
          "Strong technical skills presentation",
          "Well-structured experience section",
          "Relevant education background"
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include specific project outcomes",
          "Optimize keywords for ATS systems"
        ],
        suggestions: [
          "Consider adding a professional summary",
          "Include links to portfolio or GitHub",
          "Add relevant certifications"
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const downloadTemplate = (templateType: string) => {
    // Simulate template download
    console.log(`Downloading ${templateType} template...`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Your CV
            </CardTitle>
            <CardDescription>
              Upload your current CV to get AI-powered analysis and improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileText className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, or DOCX files only
                </p>
              </label>
            </div>
            
            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            )}
            
            <Button
              onClick={analyzeCV}
              disabled={!uploadedFile || isAnalyzing}
              className="w-full"
              variant="professional"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing CV...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze CV with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Upload and analyze your CV to see results
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-primary">{analysisResult.score}/100</span>
                  </div>
                  <Progress value={analysisResult.score} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-success mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {analysisResult.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-warning mb-2">Improvements</h4>
                    <ul className="space-y-1">
                      {analysisResult.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CV Templates */}
      {analysisResult && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Download Improved CV Templates
            </CardTitle>
            <CardDescription>
              Choose from 3 professionally designed templates with your optimized content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Professional", description: "Clean and modern design" },
                { name: "Creative", description: "Eye-catching and unique" },
                { name: "Classic", description: "Traditional and timeless" }
              ].map((template) => (
                <div key={template.name} className="border rounded-lg p-4 text-center">
                  <div className="w-full h-32 bg-gradient-subtle rounded-lg mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <Button
                    onClick={() => downloadTemplate(template.name)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}