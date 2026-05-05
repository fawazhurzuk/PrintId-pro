"use client";

import Link from "next/link";
import {
  Shield, Building2, Printer, FileCheck, ArrowRight,
  CheckCircle2, Users, Download, Palette, CreditCard
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Institution Onboarding",
    description: "Print shop owners onboard institutions with a simple registration link. Institutions register and start collecting student data immediately.",
  },
  {
    icon: Users,
    title: "Student Data Collection",
    description: "Institution members fill in every detail for ID cards — photos, personal info, and more — through an intuitive form interface.",
  },
  {
    icon: FileCheck,
    title: "Review & Approve",
    description: "Institution admins review submitted student data, verify accuracy, and finalize records for printing with one click.",
  },
  {
    icon: Printer,
    title: "Print-Ready Export",
    description: "Download student data as CSV with photos in a sequenced folder. Everything organized for immediate printing.",
  },
  {
    icon: Palette,
    title: "Custom Design Upload",
    description: "Upload your own ID card designs. Preview in horizontal or vertical format and print directly from the software.",
  },
  {
    icon: CreditCard,
    title: "Template Selection",
    description: "Choose from built-in templates in horizontal or vertical format. Preview how the ID card will look before printing.",
  },
];

const steps = [
  { step: "01", title: "Onboard Institution", description: "Print shop admin creates institution profile and sends registration link." },
  { step: "02", title: "Collect Student Data", description: "Institution members fill in student details including photos, class info, and contact." },
  { step: "03", title: "Review & Finalize", description: "Institution admin reviews all data and finalizes for print with one click." },
  { step: "04", title: "Print & Deliver", description: "Print shop receives notification, downloads data, and prints the ID cards." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-blue-900">PrintID Pro</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-blue-900 hover:text-blue-700 transition"
            >
              Admin Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
            >
              Register Institution
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20">
              <Shield size={14} className="text-cyan-400 mr-2" />
              <span className="text-sm text-cyan-100">Trusted by 100+ institutions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Student ID Cards,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              From data collection to print-ready cards — manage the entire student ID card lifecycle
              in one powerful platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                Register Your Institution
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20"
              >
                Print Shop Login
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Four simple steps to print-ready ID cards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Powerful Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need for efficient ID card management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-blue-900" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose PrintID Pro?
              </h2>
              <div className="space-y-4">
                {[
                  "Zero data loss — structured digital transfer from school to print shop",
                  "Bulk CSV export with organized photo folders for easy printing",
                  "Real-time notifications when orders are ready for production",
                  "Custom design upload with print-ready preview",
                  "Role-based access for schools, admins, and print shop operators",
                  "Docker-ready deployment — run anywhere with one command",
                ].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Institutions", value: "100+" },
                  { label: "ID Cards Printed", value: "50,000+" },
                  { label: "Data Accuracy", value: "99.9%" },
                  { label: "Avg. Turnaround", value: "< 48hrs" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
                    <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your ID Card Production?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Get started in minutes. Register your institution or login to your print shop dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Register Institution
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-700 transition border border-blue-700"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-white">PrintID Pro</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Download size={16} />
              <span>Student ID Card Management Platform</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} PrintID Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
