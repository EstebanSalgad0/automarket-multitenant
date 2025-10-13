import React, { useState } from 'react'
import { employeeManagementService } from '../services/employeeManagementService'
import type { EmployeeData } from '../services/employeeManagementService'

interface FireEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee: EmployeeData | null
  performedBy: string
  tenantId: string
}

const FireEmployeeModal: React.FC<FireEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
  performedBy,
  tenantId
}) => {
  const [reason, setReason] = useState('')
  const [notifyEmployee, setNotifyEmployee] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employee) return

    // Verificar confirmación
    const expectedConfirmText = `DESPEDIR ${employee.first_name} ${employee.last_name}`.toUpperCase()
    if (confirmText.toUpperCase() !== expectedConfirmText) {
      setError('El texto de confirmación no coincide')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await employeeManagementService.fireEmployee({
        employee_id: employee.id!,
        reason,
        performed_by: performedBy,
        tenant_id: tenantId,
        notify_employee: notifyEmployee
      })

      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError(result.error || 'Error despidiendo empleado')
      }
    } catch (err: any) {
      setError(err.message || 'Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setConfirmText('')
    setNotifyEmployee(true)
    setError('')
    onClose()
  }

  if (!isOpen || !employee) return null

  const expectedConfirmText = `DESPEDIR ${employee.first_name} ${employee.last_name}`.toUpperCase()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fed7d7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px'
          }}>
            <span style={{
              fontSize: '24px',
              color: '#c53030'
            }}>
              ⚠️
            </span>
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#c53030',
              margin: 0
            }}>
              Despedir Empleado
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#718096',
              margin: '4px 0 0 0'
            }}>
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f7fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2d3748',
            margin: '0 0 8px 0'
          }}>
            Información del Empleado
          </h3>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
            <strong>Nombre:</strong> {employee.first_name} {employee.last_name}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
            <strong>Email:</strong> {employee.email}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
            <strong>Rol:</strong> {employee.role}
          </p>
          {employee.hire_date && (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>
              <strong>Fecha de Contratación:</strong> {new Date(employee.hire_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#c53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              Razón del Despido *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="Especifica la razón del despido..."
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={notifyEmployee}
                onChange={(e) => setNotifyEmployee(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{
                fontSize: '14px',
                color: '#4a5568'
              }}>
                Notificar al empleado por email
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#c53030',
              marginBottom: '8px'
            }}>
              Para confirmar, escribe: {expectedConfirmText}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #fed7d7',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder={expectedConfirmText}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                color: '#4a5568',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f56565 0%, #c53030 100%)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading || confirmText.toUpperCase() !== expectedConfirmText}
            >
              {loading ? 'Despidiendo...' : 'Confirmar Despido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FireEmployeeModal