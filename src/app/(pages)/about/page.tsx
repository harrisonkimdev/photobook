'use client';

import Navigation from '../(components)/(layouts)/Navigation';
import { CldImage } from 'next-cloudinary';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 dark:text-white mb-6">
              About PhotoBook
            </h1>
            <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
              A beautiful way to share and preserve your photo memories with friends and family.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-primary-600 dark:text-primary-300 mb-6">
                At PhotoBook, we believe that memories are meant to be shared. Our mission is to provide a beautiful and secure platform for you to create, organize, and share your photo albums with the people who matter most.
              </p>
              <p className="text-lg text-primary-600 dark:text-primary-300">
                Whether you&apos;re documenting a special event, creating a family album, or sharing travel memories, PhotoBook makes it easy to preserve and share your moments in a meaningful way.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <CldImage
                src="photobook/about-mission"
                alt="Our mission"
                width="800"
                height="600"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-6">
              Why Choose PhotoBook?
            </h2>
            <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
              We&apos;ve built PhotoBook with your needs in mind, focusing on simplicity, security, and beautiful presentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-primary-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-primary-600 dark:text-primary-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto mb-8">
              Have questions or suggestions? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:contact@photobook.com"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Beautiful Albums',
    description: 'Create stunning photo albums with our easy-to-use interface and beautiful templates.',
  },
  {
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: 'Secure Sharing',
    description: 'Share your albums securely with password protection and privacy controls.',
  },
  {
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
    ),
    title: 'Interactive Comments',
    description: 'Engage with your audience through comments and reactions on your photos.',
  },
]; 