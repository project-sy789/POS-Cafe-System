import React, { useState } from 'react'
import { Button } from '../ui/button'
import { exportOrdersCSV } from '../../services/orderService'
import toast from 'react-hot-toast'

const ExportButton = ({ filters }) => {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      // Call the export API
      const blob = await exportOrdersCSV(filters)
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with date range if available
      let filename = 'orders-export'
      if (filters.startDate || filters.endDate) {
        const start = filters.startDate || 'all'
        const end = filters.endDate || 'all'
        filename = `orders-${start}-to-${end}`
      }
      filename += '.csv'
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('ส่งออกข้อมูลสำเร็จ')
    } catch (error) {
      console.error('Error exporting orders:', error)
      toast.error('ไม่สามารถส่งออกข้อมูลได้')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
    >
      {exporting ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          กำลังส่งออก...
        </>
      ) : (
        <>
          <span className="mr-2">📥</span>
          ส่งออก CSV
        </>
      )}
    </Button>
  )
}

export default ExportButton
