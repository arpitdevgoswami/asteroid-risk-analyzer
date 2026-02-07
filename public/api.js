// // API service for profile operations
// class ProfileAPI {
//   constructor() {
//     this.baseURL = '/api';
//     this.token = localStorage.getItem('authToken') || '';
//   }

//   setToken(token) {
//     this.token = token;
//     localStorage.setItem('authToken', token);
//   }

//   headers() {
//     return {
//       'Authorization': `Bearer ${this.token}`,
//     };
//   }

//   async getCurrentUser() {
//     const res = await fetch(`${this.baseURL}/user/me`, {
//       headers: this.headers(),
//     });
//     if (!res.ok) throw new Error('Failed to fetch user');
//     return res.json();
//   }

//   async updateProfile(name, avatarFile) {
//     const formData = new FormData();
//     if (name) formData.append('name', name);
//     if (avatarFile) formData.append('avatar', avatarFile);

//     const res = await fetch(`${this.baseURL}/user/profile`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${this.token}`,
//       },
//       body: formData,
//     });

//     if (!res.ok) throw new Error('Failed to update profile');
//     return res.json();
//   }

//   async getDemoToken() {
//     const res = await fetch(`${this.baseURL}/auth/demo-token`, {
//       method: 'POST',
//     });
//     if (!res.ok) throw new Error('Failed to get demo token');
//     return res.json();
//   }
// }

// // Export as global
// window.ProfileAPI = new ProfileAPI();
