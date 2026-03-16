import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <main className="relative bg-[#050a0e] min-h-screen overflow-x-hidden">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="prose prose-invert prose-lg max-w-none">
                    <h1 className="text-4xl font-bold text-[#F0FFFB] mb-8">Privacy Policy</h1>
                    <p className="text-[#F0FFFB]/70 mb-6">
                        Last updated: March 16, 2026
                    </p>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        At FocusBill, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our Chrome extension and website.
                    </p>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Information We Collect</h2>

                    <h3 className="text-xl font-medium text-[#F0FFFB] mt-6 mb-3">Waitlist Data</h3>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        When you join our waitlist through our landing page, we collect:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-4 list-disc list-inside">
                        <li>Email address</li>
                        <li>Date and time of signup</li>
                        <li>Waitlist status (pending, invited, converted)</li>
                    </ul>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        This information is used solely to notify you when FocusBill becomes available and to manage our beta program.
                    </p>

                    <h3 className="text-xl font-medium text-[#F0FFFB] mt-6 mb-3">Extension User Data</h3>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        When you use the FocusBill Chrome extension and opt into cloud sync, we collect:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-4 list-disc list-inside">
                        <li>Email address and display name (for account creation)</li>
                        <li>Extension version and usage data</li>
                        <li>Subscription plan information</li>
                        <li>Client information (names, rates)</li>
                        <li>Project details (names, descriptions, deadlines, amounts)</li>
                        <li>Time tracking logs (dates, durations, tasks, projects)</li>
                        <li>Invoice data (client info, items, amounts, status)</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">How We Use Your Information</h2>

                    <p className="text-[#F0FFFB]/80 mb-4">
                        We use the collected information for the following purposes:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside">
                        <li><strong>Service Provision:</strong> To provide and maintain the FocusBill extension functionality</li>
                        <li><strong>Account Management:</strong> To create and manage your user account</li>
                        <li><strong>Communication:</strong> To send you updates, newsletters, and important service notifications</li>
                        <li><strong>Waitlist Management:</strong> To manage beta access and notify you of availability</li>
                        <li><strong>Analytics:</strong> To improve our service and understand usage patterns</li>
                        <li><strong>Support:</strong> To provide customer support and troubleshooting</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Data Storage and Security</h2>

                    <p className="text-[#F0FFFB]/80 mb-4">
                        Your data is stored securely using Supabase, a PostgreSQL-based platform with enterprise-grade security features including:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside">
                        <li>End-to-end encryption</li>
                        <li>Row Level Security (RLS) policies</li>
                        <li>Regular security audits and compliance checks</li>
                        <li>Secure API access with authentication</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Data Sharing and Third Parties</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information only in the following circumstances:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside">
                        <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our service (e.g., Supabase for data storage)</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Your Rights</h2>

                    <p className="text-[#F0FFFB]/80 mb-4">
                        You have the following rights regarding your personal data:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside">
                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                        <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Data Retention</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Waitlist data is retained until you request deletion or convert to a full account. Extension data is retained while your account is active and for a reasonable period after account closure for legal and regulatory purposes.
                    </p>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Cookies and Local Storage</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        The FocusBill Chrome extension uses local storage on your device to store your data when not synced to the cloud. This data remains on your device and is not transmitted to our servers unless you enable cloud sync. We do not use tracking cookies on our website.
                    </p>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Children's Privacy</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        FocusBill is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                    </p>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Changes to This Policy</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                    </p>

                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-8 mb-4">Contact Us</h2>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        If you have any questions about this Privacy Policy or our data practices, please contact us at:
                    </p>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        Email: privacy@focusbill.app
                    </p>
                    <p className="text-[#F0FFFB]/80">
                        We will respond to your inquiries within 30 days.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}