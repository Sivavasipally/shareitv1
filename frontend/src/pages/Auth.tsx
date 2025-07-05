import React, { useState } from 'react';
import { Book, Mail, Lock, User, Home, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    flat_number: '',
    phone_number: '',
    preferred_contact: 'email',
    contact_times: [] as string[],
    interests: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error on input change
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'contact_times' | 'interests') => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, [category]: [...formData[category], value] });
    } else {
      setFormData({
        ...formData,
        [category]: formData[category].filter((item) => item !== value),
      });
    }
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return false;
      }
    } else {
      if (step === 1) {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('All fields are required');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await apiService.login(formData.email, formData.password);

        if (response.success) {
          login({
            id: response.data.user_id.toString(),
            username: response.data.username,
            email: response.data.email,
            full_name: response.data.full_name,
            flat_number: response.data.flat_number,
            phone_number: response.data.phone_number,
            preferred_contact: response.data.preferred_contact,
            contact_times: response.data.contact_times,
            interests: response.data.interests,
            isAdmin: response.data.is_admin,
          });
          onLogin();
        }
      } else {
        // Registration
        if (step < 3) {
          setStep(step + 1);
        } else {
          const response = await apiService.register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            flat_number: formData.flat_number,
            phone_number: formData.phone_number,
            preferred_contact: formData.preferred_contact,
            contact_times: formData.contact_times,
            interests: formData.interests,
          });

          if (response.success) {
            login({
              id: response.data.user_id.toString(),
              username: response.data.username,
              email: response.data.email,
              full_name: formData.full_name,
              flat_number: formData.flat_number,
              phone_number: formData.phone_number,
              preferred_contact: formData.preferred_contact,
              contact_times: formData.contact_times,
              interests: formData.interests,
              isAdmin: response.data.is_admin,
            });
            onLogin();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setError('');
    // Reset form
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      flat_number: '',
      phone_number: '',
      preferred_contact: 'email',
      contact_times: [],
      interests: [],
    });
  };

  const handleSocialLogin = async (provider: string) => {
    setError('Social login is not yet implemented');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 text-center">
          <div className="flex justify-center mb-4">
            <Book size={48} />
          </div>
          <h1 className="text-2xl font-heading font-bold">Book & Boards</h1>
          <p className="mt-2">Share, Borrow, Enjoy, Repeat</p>
        </div>

        {/* Auth Form */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back!' : `Create Your Account - Step ${step} of 3`}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
              <AlertCircle size={20} className="mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Social Login Buttons - Only show on login */}
          {isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="btn btn-outline flex items-center justify-center"
                  disabled={loading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="btn btn-outline flex items-center justify-center"
                  disabled={loading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="w-5 h-5 mr-2" />
                  Facebook
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-600">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10 w-full"
                      placeholder="Your email address"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10 w-full"
                      placeholder="Your password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Choose a username"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your email address"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Create a password (min 6 characters)"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Confirm your password"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your full name"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="flat_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Flat/House Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Home size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="flat_number"
                          name="flat_number"
                          value={formData.flat_number}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your flat or house number"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your phone number"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="preferred_contact" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        id="preferred_contact"
                        name="preferred_contact"
                        value={formData.preferred_contact}
                        onChange={handleChange}
                        className="input w-full"
                        disabled={loading}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Preferred Contact Times
                        </div>
                      </label>
                      <div className="space-y-2">
                        {['Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Weekend'].map((time) => (
                          <label key={time} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={time}
                              checked={formData.contact_times.includes(time)}
                              onChange={(e) => handleCheckboxChange(e, 'contact_times')}
                              className="rounded text-primary-600 focus:ring-primary-500"
                              disabled={loading}
                            />
                            <span>{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Areas of Interest
                      </label>
                      <div className="space-y-2">
                        {[
                          'Fiction', 'Non-Fiction', 'Children Books', 'Educational',
                          'Strategy Games', 'Family Games', 'Card Games', 'Puzzles'
                        ].map((interest) => (
                          <label key={interest} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={interest}
                              checked={formData.interests.includes(interest)}
                              onChange={(e) => handleCheckboxChange(e, 'interests')}
                              className="rounded text-primary-600 focus:ring-primary-500"
                              disabled={loading}
                            />
                            <span>{interest}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Login' : step < 3 ? 'Continue' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary-600 hover:text-primary-700 font-medium"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>

          {/* Demo credentials hint */}
          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Demo Credentials:</strong><br />
                Email: admin@shareit.com<br />
                Password: admin123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;