import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { updateMetaTags } from '../../lib/utils';

export default function CopyrightPage() {
  useEffect(() => {
    updateMetaTags({
      title: 'Copyright Information - RingBuz',
      description: 'Read about RingBuz copyright policies, DMCA compliance, and content usage guidelines. Learn how we protect intellectual property rights.',
      keywords: 'copyright policy, DMCA, content usage, intellectual property, terms of use',
      canonicalUrl: 'https://ringbuz.in/copyright',
      ogImage: 'https://ringbuz.in/images/banner.jpg'
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Copyright Information</h1>
        
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20 p-8 space-y-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Copyright Policy</h2>
              <p className="text-gray-300">
                RingBuz respects the intellectual property rights of others and expects its 
                users to do the same. We take copyright infringement seriously and will respond 
                to notices of alleged copyright infringement that comply with applicable law.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">DMCA Compliance</h3>
            <p className="text-gray-300 mb-4">
              If you believe that any content on our platform infringes your copyright, you can 
              request its removal by submitting a DMCA takedown notice containing the following information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the material that is claimed to be infringing</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief that the use is not authorized</li>
              <li>A statement that the information is accurate and that you are authorized to act</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Content Usage</h3>
            <p className="text-gray-300">
              All content on RingBuz is either user-submitted or properly licensed. Users may only 
              upload content they own or have permission to share. Downloaded content should be used 
              for personal purposes only unless otherwise specified.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <p className="text-gray-300">
              For copyright inquiries or to submit a DMCA notice, please contact our copyright agent at:{' '}
              <a href="mailto:copyright@ringbuz.in" className="text-pink-400 hover:text-pink-300">
                copyright@ringbuz.in
              </a>
            </p>
          </div>

          <div className="border-t border-pink-500/20 pt-6">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}