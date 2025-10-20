import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      paymentMethod: '',
      status: ''
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่มต้น
          </label>
          <Input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สิ้นสุด
          </label>
          <Input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วิธีชำระเงิน
          </label>
          <select
            value={localFilters.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">ทุกวิธี</option>
            <option value="Cash">เงินสด</option>
            <option value="QRCode">QR Code</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานะ
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">ทุกสถานะ</option>
            <option value="Pending">รอดำเนินการ</option>
            <option value="In Progress">กำลังทำ</option>
            <option value="Completed">เสร็จสิ้น</option>
            <option value="Cancelled">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} size="sm">
          ใช้ตัวกรอง
        </Button>
        <Button onClick={handleClearFilters} variant="outline" size="sm">
          ล้างตัวกรอง
        </Button>
      </div>
    </div>
  )
}

export default FilterBar
