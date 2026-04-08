'use client'

import { useState } from 'react'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Skill } from '@/types'
import { Toast, useToast } from '@/components/Toast'

export default function SkillsManager() {
  const { profile, addSkill, updateSkill, deleteSkill } = useProfileContext()
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('junior')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editLevel, setEditLevel] = useState('')
  const { toast, showToast, closeToast } = useToast()

  const skills = profile?.skills || []

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) {
      showToast('Vui lòng nhập tên kỹ năng', 'error')
      return
    }

    const skillName = newSkillName
    await addSkill(newSkillName, newSkillLevel)
    setNewSkillName('')
    setNewSkillLevel('junior')
    showToast(`✓ Đã thêm kỹ năng "${skillName}"`, 'success')
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingId(skill.id)
    setEditName(skill.name)
    setEditLevel(skill.level || 'junior')
  }

  const handleSaveEdit = async (skillId: number) => {
    await updateSkill(skillId, { name: editName, level: editLevel as any })
    setEditingId(null)
    setEditName('')
    setEditLevel('')
    showToast('✓ Đã cập nhật kỹ năng', 'success')
  }

  const handleDeleteSkill = async (skillId: number) => {
    if (confirm('Xóa kỹ năng này?')) {
      await deleteSkill(skillId)
      showToast('✓ Đã xóa kỹ năng', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Kỹ năng</h2>

      <form onSubmit={handleAddSkill} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Python, React, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="entry">Cơ bản</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
            >
              ✓ Thêm kỹ năng
            </button>
          </div>
        </div>

        {/* Existing skills quick reference */}
        {skills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">📌 Kỹ năng đã thêm:</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    newSkillName.trim().toLowerCase() === skill.name.toLowerCase()
                      ? 'bg-red-100 text-red-700 border border-red-300 ring-1 ring-red-400'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {skill.name}
                  <span className="text-[10px] opacity-70">({skill.level || 'N/A'})</span>
                  {newSkillName.trim().toLowerCase() === skill.name.toLowerCase() && (
                    <span className="text-red-600 font-bold">⚠ trùng</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="space-y-3">
        {skills.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có kỹ năng. Thêm kỹ năng đầu tiên!</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">📋 Tổng {skills.length} kỹ năng</p>
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg hover:shadow-md transition">
                {editingId === skill.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded"
                    />
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded"
                    >
                      <option value="entry">Cơ bản</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(skill.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                    >
                      ✓ Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      ✕ Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-semibold text-lg">{skill.name}</span>
                      <span className="mx-3 text-gray-400">•</span>
                      <span className="text-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                        {skill.level || 'N/A'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-semibold"
                      >
                        ✎ Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                      >
                        ✕ Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
