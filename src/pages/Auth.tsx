import React, { useState } from 'react';
import { Book, Mail, Lock, User, Home, Phone, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface AuthProps {
  onLogin: () => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    flatNumber: '',
    phoneNumber: '',
    preferredContact: 'email',
    contactTimes: [],
    interests: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'contactTimes' | 'interests') => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Here you would typically validate and send a login request
      login({
        id: '1',
        username: formData.username || formData.email,
        email: formData.email,
      });
      onLogin();
    } else {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Here you would typically validate and send a registration request
        login({
          id: '1',
          username: formData.username,
          email: formData.email,
          flatNumber: formData.flatNumber,
          phoneNumber: formData.phoneNumber,
          preferredContact: formData.preferredContact,
          contactTimes: formData.contactTimes,
          interests: formData.interests,
        });
        onLogin();
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
  };

  const handleSocialLogin = (provider: string) => {
    // Here you would integrate with social login providers
    console.log(`Logging in with ${provider}`);
    login({
      id: '1',
      username: 'User',
      email: 'user@example.com',
    });
    onLogin();
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
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="btn btn-outline flex items-center justify-center"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="btn btn-outline flex items-center justify-center"
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
                          placeholder="Create a password"
                          required
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
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="flatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Flat/House Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Home size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="flatNumber"
                          name="flatNumber"
                          value={formData.flatNumber}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your flat or house number"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="input pl-10 w-full"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        id="preferredContact"
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleChange}
                        className="input w-full"
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
                        {['Morning', 'Afternoon', 'Evening', 'Weekend'].map((time) => (
                          <label key={time} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={time}
                              checked={formData.contactTimes.includes(time)}
                              onChange={(e) => handleCheckboxChange(e, 'contactTimes')}
                              className="rounded text-primary-600 focus:ring-primary-500"
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
            >
              {isLogin ? 'Login' : step < 3 ? 'Continue' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;