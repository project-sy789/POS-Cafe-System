import React, { useState } from 'react'
import SettingsForm from '../components/dashboard/SettingsForm'

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('store')

  const sections = [
    { id: 'store', label: 'ข้อมูลร้าน', icon: '🏪' },
    { id: 'tax', label: 'ภาษี', icon: '💰' },
    { id: 'payment', label: 'การชำระเงิน', icon: '💳' },
    { id: 'featured', label: 'หมวดหมู่แนะนำ', icon: '⭐' },
    { id: 'theme', label: 'ธีม', icon: '🎨' },
    { id: 'branding', label: 'แบรนด์', icon: '🖼️' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">ตั้งค่าระบบ</h2>
        <p className="text-gray-600">
          ตั้งค่าข้อมูลร้าน อัตราภาษี และการชำระเงิน
        </p>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg border p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <SettingsForm activeSection={activeSection} />
    </div>
  )
}

export default SettingsPage
