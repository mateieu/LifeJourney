import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Tabs, TabsContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';
import { renderStatusBadge } from '@/lib/utils';
import { MainLayout } from '@/components/layouts/main-layout';

export default function FriendsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setFriendRequests([
        { id: 1, friend: { avatarUrl: '/avatar1.jpg', name: 'John Doe', level: 5 } },
        { id: 2, friend: { avatarUrl: '/avatar2.jpg', name: 'Jane Smith', level: 3 } },
      ]);
      setSuggestedFriends([
        { id: 1, avatarUrl: '/avatar3.jpg', name: 'Alice Johnson', level: 4, status: 'Active' },
        { id: 2, avatarUrl: '/avatar4.jpg', name: 'Bob Brown', level: 2, status: 'Inactive' },
      ]);
    }, 1000);
  }, []);

  const handleAcceptRequest = (id) => {
    // Implementation of handleAcceptRequest
  };

  const handleDeclineRequest = (id) => {
    // Implementation of handleDeclineRequest
  };

  const handleAddFriend = (id) => {
    // Implementation of handleAddFriend
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Friends</h1>
        
        <Tabs defaultValue="requests" className="mb-4">
          <TabsContent value="requests">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </Card>
              ))
            ) : friendRequests.length > 0 ? (
              friendRequests.map(request => (
                <Card key={request.id} className="p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar
                        src={request.friend.avatarUrl}
                        alt={request.friend.name}
                        className="h-12 w-12 mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{request.friend.name}</h3>
                        <p className="text-sm text-muted-foreground">Level {request.friend.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-9 w-9 text-green-500"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <FaCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-9 w-9 text-red-500"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <FaTimes className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending friend requests.</p>
                <p className="text-sm mt-1">When someone sends you a friend request, it will appear here.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggested">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </Card>
              ))
            ) : suggestedFriends.length > 0 ? (
              suggestedFriends.map(user => (
                <Card key={user.id} className="p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-12 w-12 mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Level {user.level}</span>
                          <span>•</span>
                          {renderStatusBadge(user.status)}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddFriend(user.id)}
                    >
                      <FaUserPlus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No suggested friends at the moment.</p>
                <p className="text-sm mt-1">We'll suggest friends based on similar wellness goals and activities.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Find friends section */}
        <Card className="p-6 bg-primary text-white">
          <h3 className="font-semibold mb-2">Find More Friends</h3>
          <p className="text-sm opacity-90 mb-4">
            Connect with friends to motivate each other, join team challenges, and compare progress!
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/social/find')}>
            <FaUserPlus className="mr-2 h-4 w-4" />
            Find Friends
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
} 