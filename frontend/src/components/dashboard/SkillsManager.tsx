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
    showToast(`Đã thêm kỹ năng "${skillName}"`, 'success')
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
    showToast('Đã cập nhật kỹ năng', 'success')
  }

  const handleDeleteSkill = async (skillId: number) => {
    if (confirm('Xóa kỹ năng này?')) {
      await deleteSkill(skillId)
      showToast('Đã xóa kỹ năng', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Kỹ năng</h2>

      <form onSubmit={handleAddSkill} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Python, React, ..."
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
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Thêm kỹ năng
            </button>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">Kỹ năng đã thêm:</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                    newSkillName.trim().toLowerCase() === skill.name.toLowerCase()
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {skill.name}
                  <span className="text-[10px] opacity-70">({skill.level || 'N/A'})</span>
                  {newSkillName.trim().toLowerCase() === skill.name.toLowerCase() && (
                    <span className="text-red-600 font-bold">trùng</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có kỹ năng. Thêm kỹ năng đầu tiên.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">Tổng {skills.length} kỹ năng</p>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 border border-gray-200 bg-gray-50 rounded-xl"
              >
                {editingId === skill.id ? (
                  <div className="flex gap-2 flex-1 flex-wrap">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg"
                    >
                      <option value="entry">Cơ bản</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(skill.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{skill.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold">
                        {skill.level || 'N/A'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
                      >
                        Xóa
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
