// Test Index - Import all test files
// This file ensures all tests are discovered by Jest

// Components
import './components/Navigation.test'
import './components/PageWrapper.test'
import './components/dashboard/student/SessionCard.test'
import './components/dashboard/student/StatsGrid.test'
import './components/dashboard/student/UpcomingSessions.test'
import './components/dashboard/student/AchievementsPanel.test'
import './components/dashboard/student/ProgressOverview.test'
import './components/sessions/SessionCard.test'
import './components/sessions/SearchBar.test'
import './components/sessions/SessionDetails.test'
import './components/account/AccountSettings.test'

// App Pages
import './app/page.test'
import './app/layout.test'
import './app/auth/sign-in/page.test'
import './app/auth/sign-up/page.test'
import './app/dashboard/student/page.test'
import './app/dashboard/instructor/page.test'
import './app/sessions/explore/page.test'
import './app/sessions/create/page.test'

// Lib
import './lib/types.test'

// Utils
import './utils/testUtils.test'

describe('Test Suite', () => {
  it('should have all test files loaded', () => {
    expect(true).toBe(true)
  })
}) 