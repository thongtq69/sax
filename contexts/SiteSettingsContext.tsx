'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SocialLinks {
    facebook?: string
    youtube?: string
    instagram?: string
    twitter?: string
}

interface SiteSettings {
    companyName: string
    address: string
    phone: string
    email: string
    workingHours: string
    socialLinks: SocialLinks
    footerText: string
    copyrightText: string
}

const defaultSettings: SiteSettings = {
    companyName: 'James Sax Corner',
    address: 'Ha Noi, Viet Nam',
    phone: '(702) 555-1234',
    email: 'info@jamessaxcorner.com',
    workingHours: '24/7',
    socialLinks: {
        facebook: 'https://www.facebook.com/jamessaxcorner',
        youtube: 'https://www.youtube.com/@jamessaxcorner',
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
    },
    footerText: '',
    copyrightText: '© 2024 James Sax Corner. All rights reserved.',
}

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch('/api/admin/site-settings')
                if (response.ok) {
                    const data = await response.json()
                    setSettings({
                        companyName: data.companyName || defaultSettings.companyName,
                        address: data.address || defaultSettings.address,
                        phone: data.phone || defaultSettings.phone,
                        email: data.email || defaultSettings.email,
                        workingHours: data.workingHours || defaultSettings.workingHours,
                        socialLinks: {
                            facebook: data.socialLinks?.facebook || defaultSettings.socialLinks.facebook,
                            youtube: data.socialLinks?.youtube || defaultSettings.socialLinks.youtube,
                            instagram: data.socialLinks?.instagram || defaultSettings.socialLinks.instagram,
                            twitter: data.socialLinks?.twitter || defaultSettings.socialLinks.twitter,
                        },
                        footerText: data.footerText || defaultSettings.footerText,
                        copyrightText: data.copyrightText || defaultSettings.copyrightText,
                    })
                }
            } catch (error) {
                console.error('Error fetching site settings:', error)
            }
        }
        fetchSettings()
    }, [])

    return (
        <SiteSettingsContext.Provider value={settings}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext)
}

export { defaultSettings }
export type { SiteSettings, SocialLinks }
