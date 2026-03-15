import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag, UserCircle2, Heart, ArrowRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/account')
  }

  const [orderCount, wishlistCount] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
  ])

  const cards = [
    {
      href: '/account/orders',
      title: 'My Orders',
      value: orderCount,
      description: 'Track payment, shipping, and delivery updates.',
      icon: ShoppingBag,
    },
    {
      href: '/account/profile',
      title: 'Profile',
      value: session.user.email || 'Account',
      description: 'Manage your contact details and account settings.',
      icon: UserCircle2,
    },
    {
      href: '/account/wishlist',
      title: 'Wishlist',
      value: wishlistCount,
      description: 'Keep track of instruments you want to revisit.',
      icon: Heart,
    },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(175,166,95,0.14),_transparent_35%),linear-gradient(180deg,#f8f5ea_0%,#f4f4f4_35%,#ffffff_100%)]">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-[#d8cfaa] bg-white/90 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8d7e39]">My Account</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, {session.user.name || 'collector'}.</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Your account now routes to the real order and profile flows instead of the old placeholder screen.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-[#f5efd6] p-3 text-[#8d7e39]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                </Link>
              )
            })}
          </section>
        </div>
      </div>
    </div>
  )
}
