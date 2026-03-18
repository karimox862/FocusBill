import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Privacy Policy – FocusBill",
    description:
        "FocusBill is a privacy-first Chrome extension. No data is collected, stored externally, or transmitted. All data lives on your device.",
};

export default function PrivacyPolicy() {
    return (
        <main className="relative bg-[#050a0e] min-h-screen overflow-x-hidden">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="prose prose-invert prose-lg max-w-none">

                    {/* ── Title ── */}
                    <h1 className="text-4xl font-bold text-[#F0FFFB] mb-3">
                        Privacy Policy
                    </h1>
                    <p className="text-[#F0FFFB]/50 text-sm mb-12">
                        Effective date: March 2025 &nbsp;·&nbsp; Version 2.5
                    </p>

                    {/* ── Key facts banner ── */}
                    <div className="rounded-xl border border-[#17F8AD]/30 bg-[#17F8AD]/5 p-6 mb-14">
                        <p className="text-xs font-bold tracking-widest uppercase text-[#17F8AD] mb-4">
                            Privacy at a glance
                        </p>
                        <ul className="space-y-2 not-prose">
                            {[
                                "We do NOT collect, store, or transmit any personal data.",
                                "All data is stored locally on your device using Chrome storage.",
                                "We do NOT sell, share, or transfer any user data.",
                                "We do NOT access or track your browsing history.",
                                "No data is ever sent to external servers.",
                                "No third-party analytics, advertising, or tracking tools are used.",
                            ].map((fact) => (
                                <li
                                    key={fact}
                                    className="flex items-start gap-3 text-sm text-[#17F8AD]/80"
                                >
                                    <span className="mt-0.5 text-[#17F8AD] font-bold flex-shrink-0">
                                        ✓
                                    </span>
                                    {fact}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── 1. Overview ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        1. Overview
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        FocusBill is a privacy-first Chrome extension for time tracking, focus
                        sessions, and invoice generation. All data you create inside the
                        extension — including client names, time logs, invoices, expenses, and
                        settings — is stored{" "}
                        <strong className="text-[#F0FFFB]">
                            exclusively on your local device
                        </strong>{" "}
                        using the <code className="text-[#17F8AD]">chrome.storage</code> API
                        provided by Chrome.
                    </p>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        We do not operate any servers, databases, or backend services connected
                        to the extension. There is no account system, no login, and no
                        registration. The extension works entirely offline.
                    </p>

                    {/* ── 2. Data we do NOT collect ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        2. Data We Do NOT Collect
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        The following categories of data are{" "}
                        <strong className="text-[#F0FFFB]">
                            never collected, accessed, or transmitted
                        </strong>
                        :
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-4 list-disc list-inside space-y-1">
                        <li>Personal identifiers (name, email address, physical address)</li>
                        <li>Browsing history, visited URLs, or page content</li>
                        <li>Authentication credentials of any kind</li>
                        <li>Financial account information</li>
                        <li>Device identifiers, IP addresses, or location data</li>
                        <li>Usage analytics or telemetry</li>
                        <li>Crash reports or diagnostic data</li>
                    </ul>

                    {/* Warning box */}
                    <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 mb-8 text-sm text-orange-300/90">
                        <strong className="text-orange-300">No data leaves your device.</strong>{" "}
                        This extension makes zero outbound network requests. Nothing you enter
                        or generate is ever transmitted externally.
                    </div>

                    {/* ── 3. Data stored locally ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        3. Data Stored Locally on Your Device
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        When you use FocusBill, the following data is saved to{" "}
                        <code className="text-[#17F8AD]">chrome.storage.local</code> on your
                        device only:
                    </p>

                    <div className="overflow-x-auto mb-8 not-prose">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Data Type
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Purpose
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Sent Externally?
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Client names and rates", "Time tracking and invoicing"],
                                    ["Time log entries", "Track billable hours"],
                                    ["Invoices", "Generate and store invoice records"],
                                    ["Expenses", "Track business expenses"],
                                    ["Project records", "Organise work by project"],
                                    ["Notes", "Quick notes linked to sessions"],
                                    [
                                        "Extension settings",
                                        "Timer durations, blocked site list, display preferences",
                                    ],
                                    ["Timer state", "Resume timer after browser restart"],
                                ].map(([type, purpose], i) => (
                                    <tr
                                        key={type}
                                        className={i % 2 === 0 ? "bg-white/[0.02]" : ""}
                                    >
                                        <td className="px-4 py-3 text-[#F0FFFB]/80 border border-white/10">
                                            {type}
                                        </td>
                                        <td className="px-4 py-3 text-[#F0FFFB]/60 border border-white/10">
                                            {purpose}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-[#17F8AD] border border-white/10">
                                            Never
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-[#F0FFFB]/80 mb-6">
                        All of the above data resides only in your browser&apos;s local
                        extension storage. It is never uploaded, synced, backed up, or
                        transmitted in any form to any server.
                    </p>

                    {/* ── 4. Permissions ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        4. How Chrome Permissions Are Used
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        FocusBill requests only the minimum permissions required for its core
                        features. Each permission is described below.
                    </p>

                    <div className="overflow-x-auto mb-8 not-prose">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Permission
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Why It Is Needed
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#F0FFFB]/50 font-semibold uppercase text-xs tracking-wider border border-white/10">
                                        Data Accessed
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        perm: "storage",
                                        why: "Save your time logs, clients, invoices, and settings locally on your device.",
                                        data: "Extension data only — stored locally, never transmitted.",
                                    },
                                    {
                                        perm: "alarms",
                                        why: "Run the focus timer accurately, even when the popup is closed.",
                                        data: "No user data accessed.",
                                    },
                                    {
                                        perm: "notifications",
                                        why: "Display a desktop alert when a timer session ends.",
                                        data: "No user data accessed. Notification content is generated locally.",
                                    },
                                    {
                                        perm: "tabs",
                                        why: "Used only when you explicitly activate the Block Sites feature. When a blocked site is detected, the tab URL is redirected to the extension's local blocked page.",
                                        data: "Tab URL checked against your locally-stored blocklist only. No URLs are stored, logged, or transmitted.",
                                    },
                                ].map(({ perm, why, data }, i) => (
                                    <tr
                                        key={perm}
                                        className={i % 2 === 0 ? "bg-white/[0.02]" : ""}
                                    >
                                        <td className="px-4 py-3 border border-white/10">
                                            <code className="text-[#17F8AD] text-xs font-mono bg-[#17F8AD]/10 px-2 py-0.5 rounded">
                                                {perm}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-[#F0FFFB]/70 border border-white/10">
                                            {why}
                                        </td>
                                        <td className="px-4 py-3 text-[#F0FFFB]/60 border border-white/10">
                                            {data}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-[#F0FFFB]/70 mb-6">
                        The extension does{" "}
                        <strong className="text-[#F0FFFB]">not</strong> use{" "}
                        <code className="text-[#17F8AD]">webNavigation</code>,{" "}
                        <code className="text-[#17F8AD]">&lt;all_urls&gt;</code> host
                        permissions, or content scripts. It does not inject code into web
                        pages.
                    </p>

                    {/* ── 5. Focus Mode ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        5. Focus Mode — Website Blocking
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        When you choose to activate the{" "}
                        <strong className="text-[#F0FFFB]">Block Sites</strong> feature, the
                        extension monitors tab navigations solely to redirect blocked URLs to
                        the extension&apos;s local blocked page. This check occurs only while
                        focus mode is{" "}
                        <strong className="text-[#F0FFFB]">actively enabled by you</strong>.
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside space-y-1">
                        <li>
                            The list of blocked sites is configured by you and stored locally on
                            your device.
                        </li>
                        <li>No visited URLs are recorded, logged, or stored.</li>
                        <li>No browsing history is accessed or retained.</li>
                        <li>
                            Blocking stops automatically when the timer ends or when you disable
                            it manually.
                        </li>
                    </ul>

                    {/* ── 6. No Third Parties ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        6. No Third-Party Services
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        FocusBill does not integrate with or load any third-party services.
                        There are no analytics libraries, advertising SDKs, crash reporting
                        tools, or external fonts or scripts loaded at runtime by the extension.
                        All resources are bundled locally within the extension package.
                    </p>

                    {/* ── 7. Data Retention & User Control ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        7. Data Retention and User Control
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        All data stored by this extension remains on your device for as long as
                        the extension is installed, or until you choose to delete it. You have
                        full control:
                    </p>
                    <ul className="text-[#F0FFFB]/80 mb-6 list-disc list-inside space-y-2">
                        <li>
                            <strong className="text-[#F0FFFB]">Delete all data:</strong> Open
                            the FocusBill dashboard → Settings → Data Management → Clear All
                            Data.
                        </li>
                        <li>
                            <strong className="text-[#F0FFFB]">Remove the extension:</strong>{" "}
                            Uninstalling the extension from Chrome automatically deletes all
                            locally stored data.
                        </li>
                        <li>
                            <strong className="text-[#F0FFFB]">Export your data:</strong> Go to
                            Settings → Data Management → Export All Data to download a full JSON
                            backup at any time.
                        </li>
                    </ul>

                    {/* ── 8. Landing Page / Waitlist ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        8. This Website (Landing Page)
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-4">
                        If you submit your email address via our waitlist or contact form on
                        this website, that email is used{" "}
                        <strong className="text-[#F0FFFB]">only</strong> to notify you when
                        FocusBill is available or to respond to your inquiry. We do not sell or
                        share waitlist emails with any third party. You can request deletion of
                        your email at any time by contacting us (see Section 10).
                    </p>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        This policy section applies to the website only. The Chrome extension
                        itself does not collect any email addresses or personal identifiers.
                    </p>

                    {/* ── 9. Children ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        9. Children&apos;s Privacy
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        FocusBill is not directed at children under the age of 13. Because the
                        extension does not collect any personal data at all, there are no
                        special considerations for children&apos;s data with respect to the
                        extension itself.
                    </p>

                    {/* ── 10. Changes ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        10. Changes to This Policy
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        If this privacy policy is updated, the revised version will be
                        published on this page with an updated effective date. Continued use of
                        the extension after a policy update constitutes acceptance of the
                        revised terms.
                    </p>

                    {/* ── 11. Contact ── */}
                    <h2 className="text-2xl font-semibold text-[#F0FFFB] mt-10 mb-4">
                        11. Contact
                    </h2>
                    <p className="text-[#F0FFFB]/80 mb-2">
                        If you have any questions about this privacy policy or our data
                        practices, please reach out:
                    </p>
                    <p className="text-[#F0FFFB]/80 mb-6">
                        Email:{" "}
                        <a
                            href="mailto:privacy@focusbill.app"
                            className="text-[#17F8AD] underline underline-offset-2"
                        >
                            privacy@focusbill.app
                        </a>
                        <br />
                        We will respond within 30 days.
                    </p>

                    {/* ── Footer note ── */}
                    <div className="mt-16 pt-8 border-t border-white/10 text-xs text-[#F0FFFB]/30 text-center">
                        FocusBill · Privacy Policy · Version 2.5<br />
                        This extension stores all data locally on your device.
                        No personal data is collected or transmitted.
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
