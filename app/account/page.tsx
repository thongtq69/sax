'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Sign In to Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="email" placeholder="Email Address *" />
              <Input type="password" placeholder="Password *" />
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Remember me</span>
                </label>
                <Button variant="link" className="text-sm">
                  Forgot Password?
                </Button>
              </div>
              <Button className="w-full">Sign In</Button>
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Button variant="link" className="p-0">
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">My Account</h1>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage your account settings and view order history.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No orders yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Email Address" />
              <Input placeholder="First Name" />
              <Input placeholder="Last Name" />
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

