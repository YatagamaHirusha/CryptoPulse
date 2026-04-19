'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export default function AdvertisePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    contact_role: '',
    company_size: '',
    website_url: '',
    twitter_username: '',
    telegram_username: '',
    media_interest: [] as string[],
    company_description: '',
    campaign_description: '',
    offerings_interested: [] as string[],
    budget: '',
    timeline: '',
    industry: '',
    agreed_terms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, group: 'media_interest' | 'offerings_interested') => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = prev[group];
      if (checked) {
        return { ...prev, [group]: [...current, value] };
      } else {
        return { ...prev, [group]: current.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.agreed_terms) {
      setError("Please agree to the terms regarding press releases.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: submitError } = await supabase
        .from('partnership_inquiries')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          company_name: formData.company_name,
          contact_role: formData.contact_role,
          company_size: formData.company_size,
          website_url: formData.website_url,
          twitter_username: formData.twitter_username,
          telegram_username: formData.telegram_username,
          media_interest: formData.media_interest,
          company_description: formData.company_description,
          campaign_description: formData.campaign_description,
          offerings_interested: formData.offerings_interested,
          budget: formData.budget,
          timeline: formData.timeline,
          industry: formData.industry,
          status: 'new'
        }]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] dark:bg-black py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            Application Received
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Thank you for your interest. Our team will review your application and get back to you shortly.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-brand-red text-white font-medium rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
          >
            Return Home
          </button>
        </div>
      </main>
    );
  }

  const inputClasses = "w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border-0 focus:ring-2 focus:ring-brand-red/20 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 outline-none text-slate-900 dark:text-white placeholder:text-gray-400";
  const labelClasses = "block text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide";
  const sectionTitleClasses = "text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center";

  return (
    <main className="min-h-screen bg-[#F5F5F7] dark:bg-black py-20 px-4 sm:px-6">
      
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          Partner with us
        </h1>
        <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Join the fastest-growing crypto news ecosystem.
          <br />
          Tell your story to our engaged audience.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none p-8 md:p-12 border border-white/50 dark:border-zinc-800 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Contact Info */}
          <section>
            <h2 className={sectionTitleClasses}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>First Name</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className={inputClasses} placeholder="Jane" />
              </div>
              <div>
                <label className={labelClasses}>Last Name</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className={inputClasses} placeholder="Doe" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} placeholder="jane@company.com" />
              </div>
              <div>
                <label className={labelClasses}>Telegram</label>
                <input required type="text" name="telegram_username" value={formData.telegram_username} onChange={handleInputChange} placeholder="@username" className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Twitter / X</label>
                <input type="text" name="twitter_username" value={formData.twitter_username} onChange={handleInputChange} placeholder="@username" className={inputClasses} />
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100 dark:bg-zinc-800 w-full"></div>

          {/* Company Info */}
          <section>
            <h2 className={sectionTitleClasses}>
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Company Name</label>
                <input required type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Website</label>
                <input required type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} placeholder="https://" className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Role</label>
                <input type="text" name="contact_role" value={formData.contact_role} onChange={handleInputChange} placeholder="e.g. Marketing Manager" className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Company Size</label>
                <div className="relative">
                  <select name="company_size" value={formData.company_size} onChange={handleInputChange} className={`${inputClasses} appearance-none`}>
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Industry</label>
                <div className="relative">
                  <select required name="industry" value={formData.industry} onChange={handleInputChange} className={`${inputClasses} appearance-none`}>
                    <option value="">Select industry...</option>
                    <option value="DeFi">DeFi</option>
                    <option value="NFTs/Gaming">NFTs / Gaming</option>
                    <option value="Infrastructure">Infrastructure (L1/L2)</option>
                    <option value="Exchange/Wallet">Exchange / Wallet</option>
                    <option value="Agency">Marketing Agency</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>About the project</label>
                <textarea required name="company_description" value={formData.company_description} onChange={handleInputChange} rows={4} className={inputClasses} placeholder="Briefly describe your company..."></textarea>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100 dark:bg-zinc-800 w-full"></div>

          {/* Campaign Details */}
          <section>
            <h2 className={sectionTitleClasses}>
              Campaign Goals
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className={labelClasses}>Media Interest</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Web3Instant Website', 'Newsletter', 'Social Media', 'Podcast'].map((item) => (
                    <label key={item} className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${formData.media_interest.includes(item) ? 'bg-brand-red/5 border-brand-red/30' : 'bg-gray-50 dark:bg-zinc-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.media_interest.includes(item) ? 'bg-brand-red border-brand-red' : 'border-gray-300 dark:border-zinc-600'}`}>
                        {formData.media_interest.includes(item) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input type="checkbox" value={item} onChange={(e) => handleCheckboxChange(e, 'media_interest')} className="hidden" />
                      <span className={`text-sm font-medium ${formData.media_interest.includes(item) ? 'text-brand-red' : 'text-slate-700 dark:text-zinc-300'}`}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Offering Interested</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Banner Ads', 'Sponsored Content', 'Newsletter Sponsorship', 'Educational Content', 'Event Sponsorship', 'Press Release'].map((item) => (
                    <label key={item} className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${formData.offerings_interested.includes(item) ? 'bg-brand-red/5 border-brand-red/30' : 'bg-gray-50 dark:bg-zinc-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.offerings_interested.includes(item) ? 'bg-brand-red border-brand-red' : 'border-gray-300 dark:border-zinc-600'}`}>
                        {formData.offerings_interested.includes(item) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input type="checkbox" value={item} onChange={(e) => handleCheckboxChange(e, 'offerings_interested')} className="hidden" />
                      <span className={`text-sm font-medium ${formData.offerings_interested.includes(item) ? 'text-brand-red' : 'text-slate-700 dark:text-zinc-300'}`}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Budget</label>
                  <div className="relative">
                    <select required name="budget" value={formData.budget} onChange={handleInputChange} className={`${inputClasses} appearance-none`}>
                      <option value="">Select range...</option>
                      <option value="< $500">Less than $500</option>
                      <option value="$500 - $1k">$500 - $1,000</option>
                      <option value="$1k - $5k">$1,000 - $5,000</option>
                      <option value="$5k - $10k">$5,000 - $10,000</option>
                      <option value="$10k+">$10,000+</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Timeline</label>
                  <div className="relative">
                    <select required name="timeline" value={formData.timeline} onChange={handleInputChange} className={`${inputClasses} appearance-none`}>
                      <option value="">Select timeline...</option>
                      <option value="Immediate">Immediate</option>
                      <option value="1-3 Months">1-3 Months</option>
                      <option value="3-6 Months">3-6 Months</option>
                      <option value="6+ Months">6+ Months</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Campaign Description</label>
                <textarea required name="campaign_description" value={formData.campaign_description} onChange={handleInputChange} rows={4} placeholder="Tell us about your goals..." className={inputClasses}></textarea>
              </div>
            </div>
          </section>

          {/* Terms */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.agreed_terms ? 'bg-brand-red border-brand-red' : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'}`}>
                {formData.agreed_terms && <Check className="w-3 h-3 text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={formData.agreed_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed_terms: e.target.checked }))}
                className="hidden" 
              />
              <span className="text-sm text-slate-500 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors">
                I understand that press releases are exclusively handled through our editorial team. By submitting this form, I agree to be contacted by Web3Instant.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-brand-red text-white font-semibold text-lg rounded-full hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>

        </form>
      </div>
    </main>
  );
}
