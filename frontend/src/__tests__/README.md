# Frontend Tests

This directory contains comprehensive unit and integration tests for the ACM Cloud LAUSD frontend.

## Test Structure

```
src/__tests__/
├── components/              # Unit tests for React components
│   ├── Navigation.test.tsx
│   ├── PageWrapper.test.tsx
│   ├── dashboard/
│   │   └── student/
│   │       ├── SessionCard.test.tsx
│   │       ├── StatsGrid.test.tsx
│   │       ├── UpcomingSessions.test.tsx
│   │       ├── AchievementsPanel.test.tsx
│   │       └── ProgressOverview.test.tsx
│   ├── sessions/
│   │   ├── SessionCard.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── SessionDetails.test.tsx
│   └── account/
│       └── AccountSettings.test.tsx
├── app/                     # Tests for Next.js pages
│   ├── page.test.tsx
│   ├── layout.test.tsx
│   ├── auth/
│   │   ├── sign-in/page.test.tsx
│   │   └── sign-up/page.test.tsx
│   ├── dashboard/
│   │   ├── student/page.test.tsx
│   │   └── instructor/page.test.tsx
│   └── sessions/
│       ├── explore/page.test.tsx
│       └── create/page.test.tsx
├── lib/                     # Tests for utility functions
│   └── types.test.ts
├── utils/                   # Test utilities and helpers
│   └── testUtils.tsx
├── index.test.ts            # Test index file
└── README.md               # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- --testPathPattern=Navigation
```

## Test Environment

Tests use:
- Jest as the test runner
- React Testing Library for component testing
- jsdom for DOM simulation
- Mantine provider for component context
- Mocked Next.js router and image components

## Writing Tests

### Component Tests
- Test component rendering
- Test user interactions
- Test prop handling
- Test state changes
- Test error boundaries

### Page Tests
- Test page layout
- Test data loading
- Test navigation
- Test form submissions

### Integration Tests
- Test component interactions
- Test API calls
- Test routing behavior

### Test Utilities
- `render()` - Custom render function with providers
- `mockUser`, `mockInstructor`, `mockSession`, `mockReview` - Mock data objects
- `screen` - Testing Library screen utilities
- `userEvent` - User interaction utilities

## TODO

The following test files are currently empty and need implementation:

### Components
- [ ] Navigation.test.tsx
- [ ] PageWrapper.test.tsx
- [ ] SessionCard.test.tsx (dashboard)
- [ ] StatsGrid.test.tsx
- [ ] UpcomingSessions.test.tsx
- [ ] AchievementsPanel.test.tsx
- [ ] ProgressOverview.test.tsx
- [ ] SessionCard.test.tsx (sessions)
- [ ] SearchBar.test.tsx
- [ ] SessionDetails.test.tsx
- [ ] AccountSettings.test.tsx

### App Pages
- [ ] page.test.tsx
- [ ] layout.test.tsx
- [ ] sign-in/page.test.tsx
- [ ] sign-up/page.test.tsx
- [ ] student/page.test.tsx
- [ ] instructor/page.test.tsx
- [ ] explore/page.test.tsx
- [ ] create/page.test.tsx

### Lib
- [ ] types.test.ts

## Best Practices

1. **Component Testing**: Test component behavior, not implementation details
2. **User Interactions**: Use `userEvent` for realistic user interactions
3. **Accessibility**: Test for accessibility features and ARIA attributes
4. **Mocking**: Mock external dependencies and API calls
5. **Coverage**: Aim for high test coverage, especially for critical user flows
6. **Error Cases**: Test error states and edge cases
7. **Responsive Design**: Test component behavior at different screen sizes 