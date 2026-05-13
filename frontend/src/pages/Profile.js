import React, { useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            const profileData = response.data || {};
            setProfile(profileData);
            // Normalize field names for form (handle both cases)
            setFormData({
                FirstName: profileData.FirstName || profileData.firstName || '',
                LastName: profileData.LastName || profileData.lastName || '',
                Age: profileData.Age || '',
                Gender: profileData.Gender || 'Male',
                Height: profileData.Height || '',
                Weight: profileData.Weight || '',
                Email: profileData.Email || profileData.email || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert form data to match backend expected format (lowercase keys)
            const updateData = {
                firstName: formData.FirstName || '',
                lastName: formData.LastName || '',
                age: formData.Age || 0,
                gender: formData.Gender || 'Male',
                height: formData.Height || 0,
                weight: formData.Weight || 0,
            };
            console.log('Updating profile with data:', updateData);
            await authAPI.updateProfile(updateData);
            setProfile(formData);
            setEditing(false);
            setMessage('✓ Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('✗ Error updating profile: ' + (error.response?.data?.error || error.message));
            setTimeout(() => setMessage(''), 5000);
        }
    };

    if (loading) return <div className="profile-loading">Loading...</div>;
    if (!profile) return <div className="profile-error">Error loading profile. Please try again.</div>;

    return (
        <div className="profile-page">
            <h1>👤 My Profile</h1>

            {message && <div className="message">{message}</div>}

            <div className="profile-card">
                {!editing ? (
                    <>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profile.FirstName?.[0] || profile.firstName?.[0] || 'U'}
                            </div>
                            <div className="profile-info">
                                <h2>{profile.FirstName || profile.firstName || 'User'} {profile.LastName || profile.lastName || ''}</h2>
                                <p className="username">@{profile.Username || profile.username || 'N/A'}</p>
                                <p className="email">{profile.Email || profile.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-row">
                                <label>Age:</label>
                                <span>{profile.Age || 'N/A'} {profile.Age ? 'years' : ''}</span>
                            </div>
                            <div className="detail-row">
                                <label>Gender:</label>
                                <span>{profile.Gender || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Height:</label>
                                <span>{profile.Height || 'N/A'} {profile.Height ? 'cm' : ''}</span>
                            </div>
                            <div className="detail-row">
                                <label>Weight:</label>
                                <span>{profile.Weight || 'N/A'} {profile.Weight ? 'kg' : ''}</span>
                            </div>
                            <div className="detail-row">
                                <label>Member Since:</label>
                                <span>{profile.CreatedAt ? new Date(profile.CreatedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Role:</label>
                                <span className={`role ${(profile.Role || profile.role || 'user').toLowerCase()}`}>
                                    {profile.Role || profile.role || 'User'}
                                </span>
                            </div>
                        </div>

                        <button onClick={() => setEditing(true)} className="btn-edit">
                            ✏️ Edit Profile
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="FirstName"
                                    value={formData.FirstName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="LastName"
                                    value={formData.LastName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="Age"
                                    value={formData.Age || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="Gender" value={formData.Gender || ''} onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    name="Height"
                                    value={formData.Height || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    name="Weight"
                                    value={formData.Weight || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save">Save Changes</button>
                            <button type="button" onClick={() => setEditing(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
