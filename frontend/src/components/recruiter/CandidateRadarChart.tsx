'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { RadarScores } from '@/types'

interface CandidateRadarChartProps {
  radarScores: RadarScores
  candidateName?: string
}

export default function CandidateRadarChart({
  radarScores,
  candidateName,
}: CandidateRadarChartProps) {
  const { t } = useTranslation()
  const displayName = candidateName || t('ranking.candidate_label')
  
  // Transform radar scores to Recharts data format
  const data = [
    {
      axis: t('ranking.axis_short_tech'),
      score: radarScores.technical_skills,
      fullMark: 10,
    },
    {
      axis: t('ranking.axis_short_exp'),
      score: radarScores.experience,
      fullMark: 10,
    },
    {
      axis: t('ranking.axis_short_port'),
      score: radarScores.portfolio,
      fullMark: 10,
    },
    {
      axis: t('ranking.axis_short_soft'),
      score: radarScores.soft_skills,
      fullMark: 10,
    },
    {
      axis: t('ranking.axis_short_lead'),
      score: radarScores.leadership,
      fullMark: 10,
    },
    {
      axis: t('ranking.axis_short_ready'),
      score: radarScores.readiness_signals,
      fullMark: 10,
    },
  ]

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid stroke="#e5e7eb" strokeDasharray="5 5" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <Radar
            name={displayName}
            dataKey="score"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.6}
            dot={{ fill: '#7c3aed', r: 4 }}
            activeDot={{ r: 6, fillOpacity: 0.8 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}
            formatter={(value: number) => `${value.toFixed(1)}/10`}
            labelStyle={{ color: '#1f2937' }}
          />
          <Legend wrapperStyle={{ paddingTop: '1rem' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
