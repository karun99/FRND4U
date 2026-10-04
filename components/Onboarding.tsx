import React, { useState } from 'react';
import type { UserProfile, ConversationalStyle } from '../types';
import { FrndIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const InputField = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
        {children}
    </div>
);

const baseInputClasses = "mt-1 block w-full px-4 py-3 bg-light-bg dark:bg-dark-bg rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent transition-all";
const navButtonClasses = "h-12 w-12 flex items-center justify-center rounded-full shadow-neumorphic-light dark:shadow-neumorphic-dark text-slate-600 dark:text-slate-300 hover:text-accent dark:hover:text-accent-light active:shadow-neumorphic-inset-light dark:active:shadow-neumorphic-inset-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all";
const primaryButtonClasses = "inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg text-white bg-accent-dark hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg focus:ring-accent-dark shadow-neumorphic-light dark:shadow-neumorphic-dark active:shadow-neumorphic-inset-light dark:active:shadow-neumorphic-inset-dark transition-all";


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
        userName: '',
        userAge: '',
        userGender: 'Prefer not to say',
        friendName: 'FRND4U',
        friendGender: 'Non-binary',
        friendStyle: 'Supportive & Calm',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(profile);
    };

    const canGoNext = () => {
        if (step === 1) {
            return profile.userName.trim() !== '' && profile.userAge.trim() !== '' && Number(profile.userAge) > 0;
        }
        if (step === 2) {
            return profile.friendName.trim() !== '';
        }
        return true;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-light-bg dark:bg-dark-bg">
            <div className="w-full max-w-md bg-light-bg dark:bg-dark-bg rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark p-6 sm:p-8">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 flex items-center justify-center rounded-full shadow-neumorphic-light dark:shadow-neumorphic-dark">
                        <FrndIcon className="h-10 w-10 text-accent" />
                    </div>
                </div>
                <h2 className="text-center text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-wide">
                    {step === 1 && "Welcome to FRND4U"}
                    {step === 2 && "Customize Your Virtual Friend"}
                    {step === 3 && "Ready to Start?"}
                </h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                    {step === 1 && "Let's personalize your experience. This is just for our conversation."}
                    {step === 2 && "Shape the personality of your virtual friend."}
                    {step === 3 && "Here is a summary of your choices. You can go back to change them."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <InputField id="userName" label="What should I call you?">
                                <input type="text" name="userName" id="userName" value={profile.userName} onChange={handleChange} required className={baseInputClasses} placeholder="Your Name"/>
                            </InputField>
                            <InputField id="userAge" label="Your Age">
                                <input type="number" name="userAge" id="userAge" value={profile.userAge} onChange={handleChange} required className={baseInputClasses} placeholder="e.g., 25" min="1"/>
                            </InputField>
                            <InputField id="userGender" label="Your Gender">
                                <select name="userGender" id="userGender" value={profile.userGender} onChange={handleChange} className={baseInputClasses}>
                                    <option>Prefer not to say</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Non-binary</option>
                                    <option>Other</option>
                                </select>
                            </InputField>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                             <InputField id="friendName" label="Your virtual friend's name">
                                <input type="text" name="friendName" id="friendName" value={profile.friendName} onChange={handleChange} required className={baseInputClasses} />
                            </InputField>
                             <InputField id="friendGender" label="Virtual Friend's Gender">
                                <select name="friendGender" id="friendGender" value={profile.friendGender} onChange={handleChange} className={baseInputClasses}>
                                    <option>Non-binary</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </InputField>
                             <InputField id="friendStyle" label="Conversational Style">
                                <select name="friendStyle" id="friendStyle" value={profile.friendStyle} onChange={handleChange} className={baseInputClasses}>
                                    <option>Supportive & Calm</option>
                                    <option>Direct & Solution-focused</option>
                                    <option>Inquisitive & Reflective</option>
                                    <option>Playful & Humorous</option>
                                </select>
                            </InputField>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="space-y-4 text-slate-700 dark:text-slate-300 animate-fade-in">
                            <div className="flex justify-between items-center p-4 rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark"><span>Your Name:</span> <strong className="font-semibold text-slate-800 dark:text-slate-100">{profile.userName}</strong></div>
                             <div className="flex justify-between items-center p-4 rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark"><span>Virtual Friend's Name:</span> <strong className="font-semibold text-slate-800 dark:text-slate-100">{profile.friendName}</strong></div>
                            <div className="flex justify-between items-center p-4 rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark"><span>Virtual Friend's Style:</span> <strong className="font-semibold text-slate-800 dark:text-slate-100">{profile.friendStyle}</strong></div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-between items-center">
                         <button type="button" onClick={handleBack} disabled={step === 1} className={navButtonClasses} aria-label="Go back">
                            <ChevronLeftIcon className="h-6 w-6" />
                         </button>
                         
                         <div className="flex items-center gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600 shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark'}`}></div>
                            ))}
                         </div>

                        {step < 3 ? (
                            <button type="button" onClick={handleNext} disabled={!canGoNext()} className={navButtonClasses} aria-label="Go next">
                               <ChevronRightIcon className="h-6 w-6" />
                            </button>
                        ) : (
                             <button type="submit" className={primaryButtonClasses}>
                                Let's Begin
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};