'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function LegalPage() {
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  const toggleDocument = (documentId: string) => {
    setExpandedDocument(expandedDocument === documentId ? null : documentId);
  };

  const legalDocuments = {
    'terms': {
      title: 'Terms of Service',
      description: 'The terms and conditions governing your use of Optima AI services.',
      lastUpdated: 'December 13, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      content: {
        sections: [
          {
            title: "1. Acceptance of Terms",
            content: `By accessing and using Optima AI services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

• These Terms of Service ("Terms") constitute a legally binding agreement
• Your use of the service constitutes acceptance of these terms
• We reserve the right to update these terms at any time
• Continued use after changes constitutes acceptance of new terms`
          },
          {
            title: "2. Service Description",
            content: `Optima AI provides artificial intelligence-powered chat and automation services through our platform.

• AI-powered conversational interfaces and chatbots
• API access for developers and enterprises
• Integration capabilities with third-party applications
• Analytics and performance monitoring tools
• Custom AI model training and deployment services`
          },
          {
            title: "3. User Responsibilities",
            content: `Users must comply with all applicable laws and use our service responsibly.

• Provide accurate information during registration
• Maintain the security of your account credentials
• Use the service only for lawful purposes
• Respect intellectual property rights
• Report any security vulnerabilities or abuse
• Comply with usage limits and fair use policies`
          },
          {
            title: "4. Prohibited Uses",
            content: `The following activities are strictly prohibited when using our services:

• Illegal activities or content promotion
• Harassment, hate speech, or threatening behavior
• Spam, phishing, or malicious content distribution
• Unauthorized access attempts or system disruption
• Reverse engineering or competitive intelligence gathering
• Violation of third-party rights or privacy`
          },
          {
            title: "5. Service Availability",
            content: `We strive to maintain high service availability but cannot guarantee uninterrupted access.

• Target uptime: 99.9% monthly service level
• Scheduled maintenance windows may cause temporary interruptions
• Emergency maintenance may be performed without advance notice
• Service credits may be available for extended outages under our SLA`
          }
        ]
      }
    },
    'privacy': {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information and data.',
      lastUpdated: 'December 13, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      ),
      content: {
        sections: [
          {
            title: "1. Information We Collect",
            content: `We collect information to provide better services to our users.

**Personal Information:**
• Name, email address, and contact details
• Account credentials and authentication data
• Billing and payment information
• Profile preferences and settings

**Usage Data:**
• API usage patterns and performance metrics
• Conversation logs and interaction history
• Device information and browser data
• IP addresses and geographic location data`
          },
          {
            title: "2. How We Use Your Information",
            content: `Your information is used to provide, maintain, and improve our services.

**Service Provision:**
• Account creation and management
• Processing API requests and responses
• Customer support and technical assistance
• Billing and payment processing

**Service Improvement:**
• Performance analytics and optimization
• Feature development and testing
• Security monitoring and fraud prevention
• Compliance with legal obligations`
          },
          {
            title: "3. Information Sharing",
            content: `We do not sell personal information and limit sharing to essential business purposes.

**We may share information with:**
• Service providers and business partners (under strict agreements)
• Legal authorities when required by law
• Successors in case of business transfer
• With your explicit consent

**We never share:**
• Personal information for marketing purposes
• Conversation content with third parties
• Sensitive data without legal requirement
• Information with competitors or unauthorized parties`
          },
          {
            title: "4. Data Security",
            content: `We implement robust security measures to protect your information.

**Technical Safeguards:**
• End-to-end encryption for data transmission
• Encrypted storage with industry-standard algorithms
• Regular security audits and penetration testing
• Multi-factor authentication requirements

**Operational Safeguards:**
• Employee background checks and training
• Principle of least privilege access controls
• Incident response and breach notification procedures
• Regular backup and disaster recovery testing`
          },
          {
            title: "5. Your Rights and Choices",
            content: `You have control over your personal information and privacy settings.

**Access Rights:**
• View and download your personal data
• Request corrections to inaccurate information
• Delete your account and associated data
• Port your data to another service

**Privacy Controls:**
• Manage communication preferences
• Control data sharing settings
• Opt-out of non-essential data collection
• Request processing restrictions`
          }
        ]
      }
    },
    'dpa': {
      title: 'Data Processing Agreement',
      description: 'GDPR-compliant data processing terms for enterprise customers.',
      lastUpdated: 'December 1, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      ),
      content: {
        sections: [
          {
            title: "1. Definitions and Scope",
            content: `This Data Processing Agreement (DPA) establishes the terms for processing personal data under GDPR.

**Key Definitions:**
• Controller: Your organization determining purposes of data processing
• Processor: Optima AI processing personal data on your behalf
• Personal Data: Any information relating to identified individuals
• Processing: Any operation performed on personal data

**Scope of Agreement:**
• Applies to all personal data processed through our services
• Covers both automated and manual processing activities
• Extends to all employees and subprocessors
• Supplements our main service agreement`
          },
          {
            title: "2. Data Processing Principles",
            content: `We process personal data in accordance with GDPR principles and your instructions.

**Processing Principles:**
• Lawfulness, fairness, and transparency
• Purpose limitation and data minimization
• Accuracy and storage limitation
• Integrity, confidentiality, and accountability

**Processing Activities:**
• API request processing and response generation
• Conversation analysis and improvement
• Performance monitoring and analytics
• Security monitoring and incident response`
          },
          {
            title: "3. Data Subject Rights",
            content: `We support your obligations to respect data subject rights under GDPR.

**Supported Rights:**
• Right of access to personal data
• Right to rectification of inaccurate data
• Right to erasure ("right to be forgotten")
• Right to restrict processing
• Right to data portability
• Right to object to processing

**Our Commitments:**
• Respond to rights requests within 30 days
• Provide technical assistance for rights fulfillment
• Implement appropriate technical measures
• Maintain records of processing activities`
          },
          {
            title: "4. Security and Confidentiality",
            content: `We implement appropriate technical and organizational security measures.

**Technical Measures:**
• Encryption of personal data in transit and at rest
• Regular security testing and vulnerability assessments
• Access controls and authentication requirements
• Secure data deletion and backup procedures

**Organizational Measures:**
• Employee confidentiality agreements
• Data protection training programs
• Incident response and breach notification procedures
• Regular compliance audits and reviews`
          },
          {
            title: "5. Subprocessors and International Transfers",
            content: `We carefully manage subprocessors and international data transfers.

**Subprocessor Management:**
• Due diligence on all subprocessors
• Contractual obligations equivalent to this DPA
• Regular monitoring and auditing
• Right to object to new subprocessors

**International Transfers:**
• Standard Contractual Clauses for non-EU transfers
• Adequacy decisions where applicable
• Supplementary measures for high-risk transfers
• Transparency about data locations and flows`
          }
        ]
      }
    },
    'aup': {
      title: 'Acceptable Use Policy',
      description: 'Guidelines for appropriate use of Optima AI services and prohibited activities.',
      lastUpdated: 'November 15, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      ),
      content: {
        sections: [
          {
            title: "1. General Usage Guidelines",
            content: `These guidelines ensure fair and responsible use of Optima AI services for all users.

**Acceptable Use:**
• Business automation and productivity enhancement
• Educational and research purposes
• Creative content generation and assistance
• Customer service and support applications
• Personal productivity and learning

**Usage Principles:**
• Respect for other users and service capacity
• Compliance with all applicable laws and regulations
• Adherence to ethical AI practices
• Protection of privacy and confidentiality
• Responsible resource consumption`
          },
          {
            title: "2. Prohibited Content and Activities",
            content: `The following content and activities are strictly prohibited on our platform.

**Illegal Content:**
• Copyright infringement or piracy
• Illegal gambling or financial schemes
• Drug trafficking or illegal substance promotion
• Terrorism or violence incitement
• Child exploitation or abuse material

**Harmful Content:**
• Hate speech or discriminatory content
• Harassment, bullying, or threatening behavior
• Malware, viruses, or malicious code
• Spam or unsolicited commercial communications
• Misinformation or deliberately false content`
          },
          {
            title: "3. Technical Usage Limits",
            content: `We implement usage limits to ensure fair access and optimal performance for all users.

**Rate Limits:**
• API request limits per minute/hour/day
• Concurrent connection restrictions
• Data transfer and storage quotas
• Response time and processing limits

**Fair Use Policy:**
• Reasonable use consistent with your subscription plan
• No excessive resource consumption that impacts others
• Prohibition of load testing without prior approval
• Compliance with documented API specifications`
          },
          {
            title: "4. Security and Compliance",
            content: `Users must maintain security best practices and comply with applicable regulations.

**Security Requirements:**
• Secure storage of API keys and credentials
• Regular security updates and patches
• Proper access controls and user management
• Incident reporting and response procedures

**Compliance Obligations:**
• Adherence to industry-specific regulations
• Data protection and privacy law compliance
• Export control and international trade regulations
• Professional and ethical standards in your industry`
          },
          {
            title: "5. Enforcement and Violations",
            content: `We actively monitor for policy violations and take appropriate enforcement actions.

**Monitoring and Detection:**
• Automated content scanning and analysis
• User reporting and community moderation
• Regular compliance audits and reviews
• Security monitoring and threat detection

**Enforcement Actions:**
• Warning notices and educational outreach
• Temporary service restrictions or suspensions
• Account termination for serious violations
• Legal action for criminal or harmful activities
• Cooperation with law enforcement when required`
          }
        ]
      }
    },
    'cookies': {
      title: 'Cookie Policy',
      description: 'Information about how we use cookies and similar tracking technologies.',
      lastUpdated: 'October 1, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3m0 9l3-3m-3 3l3 3m-3-3l-3-3m3 3l-3 3" />
      ),
      content: {
        sections: [
          {
            title: "1. What Are Cookies",
            content: `Cookies are small text files stored on your device to enhance your browsing experience.

**Types of Cookies:**
• Session cookies: Temporary cookies deleted when you close your browser
• Persistent cookies: Remain on your device for a specified period
• First-party cookies: Set by our website directly
• Third-party cookies: Set by external services we use

**Cookie Information:**
• Name and unique identifier
• Expiration date and domain
• Secure and HttpOnly flags
• SameSite attribute for security`
          },
          {
            title: "2. How We Use Cookies",
            content: `We use cookies to provide essential functionality and improve our services.

**Essential Cookies:**
• User authentication and session management
• Security and fraud prevention
• Load balancing and performance optimization
• Shopping cart and form data persistence

**Analytics Cookies:**
• Website usage patterns and statistics
• Feature adoption and user behavior analysis
• Performance monitoring and error tracking
• A/B testing and optimization insights`
          },
          {
            title: "3. Third-Party Cookies",
            content: `Some cookies are set by third-party services we integrate with our platform.

**Analytics Services:**
• Google Analytics for website traffic analysis
• Mixpanel for user behavior tracking
• Hotjar for user experience insights
• DataDog for performance monitoring

**Marketing and Advertising:**
• Social media integration cookies
• Conversion tracking pixels
• Retargeting and remarketing cookies
• Attribution and campaign measurement`
          },
          {
            title: "4. Cookie Management",
            content: `You have control over cookie settings and can manage your preferences.

**Browser Controls:**
• Most browsers allow you to view, manage, and delete cookies
• You can set browsers to notify you when cookies are set
• Incognito/private browsing modes limit cookie storage
• Browser extensions can provide additional cookie control

**Our Cookie Controls:**
• Cookie consent banner for new visitors
• Cookie preference center for granular control
• Opt-out options for non-essential cookies
• Regular cookie audits and cleanup`
          },
          {
            title: "5. Cookie Categories and Retention",
            content: `We categorize cookies by purpose and apply appropriate retention periods.

**Strictly Necessary (Cannot be disabled):**
• Authentication tokens: Session duration
• Security cookies: 24 hours
• Load balancer cookies: Session duration

**Functional (Can be disabled):**
• Preference cookies: 1 year
• Language settings: 1 year
• UI customization: 6 months

**Analytics (Can be disabled):**
• Usage analytics: 2 years
• Performance monitoring: 90 days
• Error tracking: 30 days`
          }
        ]
      }
    },
    'security': {
      title: 'Security Policy',
      description: 'Our approach to security, compliance, and responsible AI practices.',
      lastUpdated: 'November 1, 2024',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
      content: {
        sections: [
          {
            title: "1. Security Framework",
            content: `Our comprehensive security framework protects data and ensures service integrity.

**Security Principles:**
• Defense in depth with multiple security layers
• Zero-trust architecture and continuous verification
• Principle of least privilege access controls
• Regular security assessments and improvements

**Compliance Standards:**
• SOC 2 Type II certification
• ISO 27001 information security management
• GDPR and privacy regulation compliance
• Industry-specific security requirements`
          },
          {
            title: "2. Data Protection",
            content: `We implement robust measures to protect data at rest, in transit, and in processing.

**Encryption:**
• AES-256 encryption for data at rest
• TLS 1.3 for data in transit
• End-to-end encryption for sensitive communications
• Hardware security modules for key management

**Access Controls:**
• Multi-factor authentication requirements
• Role-based access control (RBAC)
• Regular access reviews and deprovisioning
• Privileged access management (PAM) solutions`
          },
          {
            title: "3. Infrastructure Security",
            content: `Our infrastructure is designed with security as a foundational principle.

**Cloud Security:**
• Multi-region deployment with failover capabilities
• Network segmentation and micro-segmentation
• DDoS protection and traffic filtering
• Regular vulnerability scanning and patching

**Monitoring and Detection:**
• 24/7 security operations center (SOC)
• Security information and event management (SIEM)
• Intrusion detection and prevention systems
• Automated threat intelligence integration`
          },
          {
            title: "4. Application Security",
            content: `We follow secure development practices and conduct regular security testing.

**Secure Development:**
• Security by design methodology
• Code review and static analysis
• Dependency scanning and management
• Secure configuration management

**Testing and Validation:**
• Regular penetration testing by third parties
• Dynamic application security testing (DAST)
• Bug bounty program for responsible disclosure
• Continuous security monitoring and alerting`
          },
          {
            title: "5. Incident Response",
            content: `We maintain comprehensive incident response capabilities for rapid threat mitigation.

**Response Process:**
• 24/7 incident detection and alerting
• Escalation procedures and communication plans
• Forensic analysis and evidence preservation
• Post-incident review and improvement

**Business Continuity:**
• Disaster recovery and backup procedures
• Business continuity planning and testing
• Communication protocols during incidents
• Service restoration and damage assessment

**Transparency:**
• Regular security reports and updates
• Incident disclosure when appropriate
• Customer notification procedures
• Collaboration with security researchers`
          }
        ]
      }
    }
  };

  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white">
      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
          
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
              Legal
            </span>
            <br />
            <span className="text-white">Terms & Policies</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Our commitment to transparency and legal compliance. Find all our terms, policies, and legal documents here.
          </p>
          </div>
        </div>
      </section>      {/* Legal Documents */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(legalDocuments).map(([key, doc]) => (
              <div key={key} className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] hover:border-[#58a6ff]/30 transition-all duration-300">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleDocument(key)}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {doc.icon}
                    </svg>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{doc.title}</h3>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        expandedDocument === key ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">{doc.description}</p>
                  <p className="text-sm text-gray-500 mb-4">Last updated: {doc.lastUpdated}</p>
                  <span className="text-[#58a6ff] text-sm hover:underline">
                    {expandedDocument === key ? 'Hide Document' : 'Read Full Document'} →
                  </span>
                </div>
                
                {expandedDocument === key && (
                  <div className="border-t border-[#2f343c] p-6 bg-[#161617] animate-fadeIn">
                    <div className="space-y-8">
                      {doc.content.sections.map((section, index) => (
                        <div key={index} className="space-y-4">
                          <h4 className="text-lg font-semibold text-[#58a6ff] border-l-4 border-[#58a6ff] pl-4">
                            {section.title}
                          </h4>
                          <div className="pl-4 space-y-3">
                            {section.content.split('\n\n').map((paragraph, pIndex) => (
                              <div key={pIndex}>
                                {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                                  <h5 className="font-semibold text-white mb-2">
                                    {paragraph.replace(/\*\*/g, '')}
                                  </h5>
                                ) : paragraph.startsWith('•') ? (
                                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                                    {paragraph.split('\n').map((item, iIndex) => (
                                      <li key={iIndex} className="text-sm">
                                        {item.replace('• ', '')}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    {paragraph}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#2f343c] flex flex-col sm:flex-row gap-4">
                      <button className="flex-1 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        Download PDF
                      </button>
                      <button className="flex-1 border border-[#58a6ff] text-[#58a6ff] px-4 py-3 rounded-lg font-medium hover:bg-[#58a6ff] hover:text-white transition-colors">
                        Print Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Compliance & Certifications</h2>
            <p className="text-xl text-gray-400">We maintain the highest standards of security and compliance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">GDPR</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">GDPR Compliant</h3>
              <p className="text-gray-400 text-sm">Full compliance with European data protection regulations.</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">SOC2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">SOC 2 Type II</h3>
              <p className="text-gray-400 text-sm">Certified for security, availability, and confidentiality.</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">ISO</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">ISO 27001</h3>
              <p className="text-gray-400 text-sm">International standard for information security management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Legal */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a1a1b] rounded-lg p-8 border border-[#2f343c]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-white">Legal Inquiries</h2>
              <p className="text-xl text-gray-400">
                Have questions about our legal documents or need specific compliance information?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#58a6ff]">General Legal Questions</h3>
                <p className="text-gray-300 mb-4">
                  For questions about our terms, policies, or general legal matters.
                </p>
                <p className="text-gray-400">
                  <strong>Email:</strong> legal@optima.ai<br />
                  <strong>Response Time:</strong> 2-3 business days
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#58a6ff]">Enterprise & Compliance</h3>
                <p className="text-gray-300 mb-4">
                  For enterprise customers needing compliance documentation or custom agreements.
                </p>
                <p className="text-gray-400">
                  <strong>Email:</strong> compliance@optima.ai<br />
                  <strong>Response Time:</strong> 1-2 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8 text-white">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Corporate Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Company Name:</strong> Optima AI, Inc.</p>
                <p><strong>Incorporation:</strong> Delaware, USA</p>
                <p><strong>Registration Number:</strong> 7891234</p>
                <p><strong>Tax ID:</strong> 12-3456789</p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Registered Address</h3>
              <div className="text-gray-300">
                <p>Optima AI, Inc.</p>
                <p>123 Innovation Drive</p>
                <p>Suite 456</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Need Help with Legal Matters?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Our legal team is here to assist with any questions or concerns you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Legal Team
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    
      {/* Footer */}
      <footer className="border-t border-[#2f343c] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">Optima AI</span>
              </Link>
              <p className="mt-2 text-xs text-gray-400">
                by Optima, Inc.
              </p>
              <p className="mt-4 text-gray-400">
                Next-generation AI chat platform for developers and teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Integrations</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-[#58a6ff] transition-colors">API Reference</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Blog</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Tutorials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-[#58a6ff] transition-colors">About Optima, Inc.</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Contact</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#2f343c] flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Optima, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer></div>
  );
}
