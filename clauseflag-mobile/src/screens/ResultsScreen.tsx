import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, RiskColors, RiskLevels, API_BASE_URL } from '../constants';
import { RootStackParamList, AnalysisResult, Clause, RiskLevel } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface ClauseCardProps {
  clause: Clause;
  expanded: boolean;
  onToggle: () => void;
}

function ClauseCard({ clause, expanded, onToggle }: ClauseCardProps) {
  const riskColor = RiskColors[clause.riskLevel];
  const riskLabel = clause.riskLevel.charAt(0).toUpperCase() + clause.riskLevel.slice(1);

  return (
    <TouchableOpacity
      style={[styles.clauseCard, { borderLeftColor: riskColor }]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.clauseHeader}>
        <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
          <Text style={styles.riskBadgeText}>{riskLabel} Risk</Text>
        </View>
        <Text style={styles.clauseType}>
          {clause.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </View>

      <Text style={styles.clauseText} numberOfLines={expanded ? undefined : 2}>
        "{clause.text}"
      </Text>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.explanationSection}>
            <Text style={styles.sectionLabel}>What it means:</Text>
            <Text style={styles.explanationText}>{clause.explanation}</Text>
          </View>

          <View style={styles.whyMattersSection}>
            <Text style={styles.sectionLabel}>Why it matters:</Text>
            <Text style={styles.whyMattersText}>{clause.whyMatters}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { analysisId } = route.params;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis');
      }

      setAnalysis(data);
    } catch (err) {
      console.error('Fetch analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleEmailReport = () => {
    navigation.navigate('Email', { analysisId });
  };

  const toggleClause = (clauseId: string) => {
    setExpandedClauseId(expandedClauseId === clauseId ? null : clauseId);
  };

  const filteredClauses = analysis?.clauses.filter(
    (clause) => filter === 'all' || clause.riskLevel === filter
  ) || [];

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevels.LOW:
        return '✓';
      case RiskLevels.MEDIUM:
        return '⚠️';
      case RiskLevels.HIGH:
        return '🚨';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.navy} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error || 'Analysis not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAnalysis}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>
          
          <View style={styles.riskSummary}>
            <View style={[styles.riskBox, { backgroundColor: RiskColors.low }]}>
              <Text style={styles.riskCount}>{analysis.summary.lowRisk}</Text>
              <Text style={styles.riskLabel}>Low Risk</Text>
            </View>
            <View style={[styles.riskBox, { backgroundColor: RiskColors.medium }]}>
              <Text style={styles.riskCount}>{analysis.summary.mediumRisk}</Text>
              <Text style={styles.riskLabel}>Medium</Text>
            </View>
            <View style={[styles.riskBox, { backgroundColor: RiskColors.high }]}>
              <Text style={styles.riskCount}>{analysis.summary.highRisk}</Text>
              <Text style={styles.riskLabel}>High Risk</Text>
            </View>
          </View>

          <Text style={styles.totalClauses}>
            {analysis.summary.totalClauses} clauses analyzed
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by risk:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === RiskLevels.HIGH && styles.filterButtonActiveHigh]}
              onPress={() => setFilter(RiskLevels.HIGH)}
            >
              <Text style={[styles.filterButtonText, filter === RiskLevels.HIGH && styles.filterButtonTextActive]}>
                High Risk
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === RiskLevels.MEDIUM && styles.filterButtonActiveMedium]}
              onPress={() => setFilter(RiskLevels.MEDIUM)}
            >
              <Text style={[styles.filterButtonText, filter === RiskLevels.MEDIUM && styles.filterButtonTextActive]}>
                Medium
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === RiskLevels.LOW && styles.filterButtonActiveLow]}
              onPress={() => setFilter(RiskLevels.LOW)}
            >
              <Text style={[styles.filterButtonText, filter === RiskLevels.LOW && styles.filterButtonTextActive]}>
                Low Risk
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Clause Cards */}
        <View style={styles.clausesContainer}>
          <Text style={styles.clausesTitle}>
            {filteredClauses.length} {filter !== 'all' ? `${filter} risk ` : ''}clauses found
          </Text>
          
          {filteredClauses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>No {filter} risk clauses found</Text>
            </View>
          ) : (
            filteredClauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                expanded={expandedClauseId === clause.id}
                onToggle={() => toggleClause(clause.id)}
              />
            ))
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and does not constitute legal advice.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailReport}>
          <Text style={styles.emailButtonText}>📧 Email Full Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.newScanButton}
          onPress={() => navigation.navigate('Welcome')}
        >
          <Text style={styles.newScanButtonText}>Scan Another Contract</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 20,
  },
  riskSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riskBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  riskCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  riskLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  totalClauses: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterButtonActiveHigh: {
    backgroundColor: RiskColors.high,
    borderColor: RiskColors.high,
  },
  filterButtonActiveMedium: {
    backgroundColor: RiskColors.medium,
    borderColor: RiskColors.medium,
  },
  filterButtonActiveLow: {
    backgroundColor: RiskColors.low,
    borderColor: RiskColors.low,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  clausesContainer: {
    marginBottom: 24,
  },
  clausesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  clauseCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  riskBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clauseType: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.gray,
  },
  clauseText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  explanationSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  whyMattersSection: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  whyMattersText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange,
    marginBottom: 24,
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: Colors.white,
  },
  emailButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emailButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  newScanButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.navy,
  },
  newScanButtonText: {
    color: Colors.navy,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
