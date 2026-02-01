import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  FileText,
  BrainCircuit,
  DollarSign,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AnalysisResult, ClauseAnalysis, ClauseType, RiskLevel } from '@clauseflag/shared';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onRestart: () => void;
}

const riskColors = {
  High: 'text-red-600 bg-red-50/50 border-red-200',
  Medium: 'text-amber-600 bg-amber-50/50 border-amber-200',
  Low: 'text-green-600 bg-green-50/50 border-green-200'
};

const clauseIcons = {
  termination: <XCircle className="w-5 h-5" />,
  liability_limitation: <AlertTriangle className="w-5 h-5" />,
  indemnity: <XCircle className="w-5 h-5" />,
  auto_renewal: <XCircle className="w-5 h-5" />,
  payment_penalties: <DollarSign className="w-5 h-5" />,
  governing_law: <Info className="w-5 h-5" />,
  ip_ownership: <Lock className="w-5 h-5" />,
  non_compete: <XCircle className="w-5 h-5" />
};

const clauseNames = {
  termination: 'Termination Clause',
  liability_limitation: 'Liability Limitation',
  indemnity: 'Indemnity Clause',
  auto_renewal: 'Auto-Renewal Clause',
  payment_penalties: 'Payment Penalties',
  governing_law: 'Governing Law',
  ip_ownership: 'IP Ownership',
  non_compete: 'Non-Compete Clause'
};

export default function AnalysisResults({ result, onRestart }: AnalysisResultsProps) {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  const toggleClause = (clauseId: string) => {
    setExpandedClause(expandedClause === clauseId ? null : clauseId);
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-amber-600 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Analysis Complete</h1>
            <p className="text-blue-100">Your contract has been scanned for risky clauses</p>
          </motion.div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{result.highRiskCount}</div>
                <div className="text-sm text-gray-300">High Risk Clauses</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-600">{result.mediumRiskCount}</div>
                <div className="text-sm text-gray-300">Medium Risk Clauses</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{result.lowRiskCount}</div>
                <div className="text-sm text-gray-300">Low Risk Clauses</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Risky Clauses Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Risky Clauses Found</h2>
            <button
              onClick={onRestart}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Scan Another Contract
            </button>
          </div>

          {result.analyses
            .filter(clause => clause.isRisky)
            .map((analysis, index) => (
              <motion.div
                key={analysis.clauseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="bg-white p-6">
                  {/* Clause Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {clauseIcons[analysis.clauseType || 'termination']}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {clauseNames[analysis.clauseType || 'termination']}
                        </h3>
                        <div className={`text-sm font-medium ${riskColors[analysis.riskLevel || 'Medium']}`}>
                          {analysis.riskLevel} Risk
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleClause(analysis.clauseId)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedClause === analysis.clauseId ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Clause Text */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
                    {analysis.clauseId}
                  </div>

                  {/* Explanation */}
                  <div className={`p-4 ${expandedClause === analysis.clauseId ? '' : 'hidden'}`}>
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="ml-3 text-sm text-blue-800">
                          {analysis.explanation || 'No explanation available'}
                        </div>
                      </div>
                    </div>

                    {analysis.whyItMatters && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="ml-3 text-sm text-amber-800">
                            {analysis.whyItMatters}
                          </div>
                        </div>
                      </div>
                    )}

                    {analysis.jurisdictionNote && (
                      <div className="bg-green-50 rounded-lg p-3 mt-3">
                        <div className="flex items-start">
                          <ShieldAlert className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="ml-3 text-sm text-green-800">
                            {analysis.jurisdictionNote}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

          {result.analyses.filter(clause => clause.isRisky).length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Risky Clauses Found</h3>
              <p className="text-gray-600">
                This contract appears to be free of high-risk clauses based on our analysis.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}