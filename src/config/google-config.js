export const googleConfig = {
  clientId: '301770710898-nlkb9lea02sk9irh4vpdth0m0ingrv90.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ],
  apiEndpoint: 'https://www.googleapis.com/calendar/v3',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  redirectUri: 'http://localhost:5173/oauth2callback'
}; 