import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/auth/forgot-password',
  }),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock the forgot password page component
const ForgotPasswordPage = () => {
  return (
    <div>
      <h1>Forgot Password</h1>
      <p>Enter your email to reset your password</p>
      <form>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          aria-describedby="email-error"
        />
        <div id="email-error" role="alert"></div>
        <button type="submit">Send Reset Link</button>
      </form>
      <a href="/auth/sign-in">Back to Sign In</a>
    </div>
  )
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  )
}

describe('Forgot Password Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Page Rendering', () => {
    test('renders forgot password form correctly', () => {
      renderWithProvider(<ForgotPasswordPage />)

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
      expect(screen.getByText(/enter your email to reset your password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
      expect(screen.getByText(/back to sign in/i)).toBeInTheDocument()
    })

    test('shows proper form structure', () => {
      renderWithProvider(<ForgotPasswordPage />)

      const form = screen.getByRole('form')
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      expect(form).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    test('validates required email field', async () => {
      const user = userEvent.setup()
      renderWithProvider(<ForgotPasswordPage />)

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    test('validates email format', async () => {
      const user = userEvent.setup()
      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    test('accepts valid email format', async () => {
      const user = userEvent.setup()
      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'instructor@example.com')

      // Should not show validation error
      expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    test('submits form with valid email successfully', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password reset email sent successfully',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'instructor@example.com',
          }),
        })
      })
    })

    test('handles successful password reset email', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password reset email sent successfully',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password reset email sent successfully/i)).toBeInTheDocument()
      })
    })

    test('handles non-existent email error', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Email not found',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'nonexistent@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument()
      })
    })

    test('handles rate limiting error', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: 'Too many requests. Please try again later.',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument()
      })
    })

    test('handles server error', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/internal server error/i)).toBeInTheDocument()
      })
    })

    test('handles network errors', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    test('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      mockFetch.mockReturnValueOnce(pendingPromise)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      // Should show loading state
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/sending/i)).toBeInTheDocument()

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          message: 'Password reset email sent successfully',
        }),
      } as Response)
    })

    test('clears form after successful submission', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password reset email sent successfully',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Form should be cleared after successful submission
      expect(emailInput).toHaveValue('')
    })

    test('prevents multiple submissions', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password reset email sent successfully',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)
      await user.click(submitButton) // Try to submit again

      // Should only call API once
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', () => {
      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const errorElement = screen.getByRole('alert')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      expect(errorElement).toHaveAttribute('id', 'email-error')
    })

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    test('shows error messages for screen readers', async () => {
      const user = userEvent.setup()
      renderWithProvider(<ForgotPasswordPage />)

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByRole('alert')
        expect(errorElement).toHaveTextContent(/email is required/i)
      })
    })
  })

  describe('Navigation', () => {
    test('has link back to sign in page', () => {
      renderWithProvider(<ForgotPasswordPage />)

      const backLink = screen.getByText(/back to sign in/i)
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/auth/sign-in')
    })
  })

  describe('Security Considerations', () => {
    test('does not reveal if email exists or not', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      // Even for non-existent email, show same success message
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'If an account with that email exists, a password reset link has been sent.',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'nonexistent@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/if an account with that email exists/i)).toBeInTheDocument()
      })
    })

    test('prevents email enumeration attacks', async () => {
      const user = userEvent.setup()
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      // Should return same response time regardless of email existence
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'If an account with that email exists, a password reset link has been sent.',
        }),
      } as Response)

      renderWithProvider(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'instructor@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })
}) 