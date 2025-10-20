import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import UserForm from './UserForm'
import { getUsers, deleteUser } from '../../services/userService'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

const StaffManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const currentUser = useAuthStore((state) => state.user)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId, username) => {
    // Prevent deleting self
    if (currentUser && currentUser.id === userId) {
      toast.error('You cannot delete your own account')
      return
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${username}"?`)) {
      return
    }

    try {
      await deleteUser(userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
      console.error('Error deleting user:', error)
    }
  }

  const handleFormClose = (success) => {
    setShowForm(false)
    setEditingUser(null)
    if (success) {
      fetchUsers()
    }
  }

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Manager':
        return 'bg-purple-100 text-purple-800'
      case 'Cashier':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading staff...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">บัญชีพนักงาน</h3>
          <p className="text-sm text-gray-600">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        <Button onClick={handleCreate}>
          + เพิ่มผู้ใช้
        </Button>
      </div>

      {/* User Form Modal/Dialog */}
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleFormClose}
        />
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No users found</p>
            <Button onClick={handleCreate}>Create your first user</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อผู้ใช้
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    บทบาท
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สร้าง
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => {
                  const isCurrentUser = currentUser && currentUser.id === user._id
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-900">
                            {user.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">(คุณ)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`
                            inline-flex px-2 py-1 text-xs font-semibold rounded-full
                            ${getRoleBadgeColor(user.role)}
                          `}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user._id, user.username)}
                            disabled={isCurrentUser}
                            className={`
                              ${isCurrentUser
                                ? 'opacity-50 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              }
                            `}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement
