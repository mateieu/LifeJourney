import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaDumbbell, FaRunning, FaBrain, FaApple, FaBed, FaShieldAlt, FaEdit, FaCoins, FaStore, FaTrophy } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layouts/main-layout';

const CharacterPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [character, setCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  const getClassTitle = (characterClass: string) => {
    switch(characterClass) {
      case 'warrior':
        return 'Strength Champion';
      case 'ranger':
        return 'Cardio Master';
      case 'mage':
        return 'Mindfulness Guru';
      case 'monk':
        return 'Balance Seeker';
      case 'paladin':
        return 'Wellness Protector';
      default:
        return 'Adventurer';
    }
  };
  
  const getStatIcon = (statName: string) => {
    switch(statName) {
      case 'strength':
        return <FaDumbbell className="text-red-500" />;
      case 'endurance':
        return <FaRunning className="text-green-500" />;
      case 'mindfulness':
        return <FaBrain className="text-purple-500" />;
      case 'nutrition':
        return <FaApple className="text-orange-500" />;
      case 'rest':
        return <FaBed className="text-blue-500" />;
      case 'willpower':
        return <FaShieldAlt className="text-amber-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'uncommon':
        return 'text-green-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-purple-500';
      case 'legendary':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-lg mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="h-6 w-1/2 bg-muted rounded-md mx-auto"></div>
            <div className="h-4 w-1/3 bg-muted rounded-md mx-auto"></div>
            <div className="h-8 w-full bg-muted rounded-md"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded-md"></div>
              <div className="h-20 bg-muted rounded-md"></div>
              <div className="h-20 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!character) {
    return (
      <MainLayout>
        <div className="container max-w-lg mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't retrieve your character data.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Character Banner */}
        <Card className="overflow-hidden mb-6 bg-primary">
          <div className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <img 
                  src={character.avatarUrl || '/images/default-avatar.png'} 
                  alt="Character avatar"
                  className="w-20 h-20 rounded-full"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push('/character/customize')}
              >
                <FaEdit className="mr-2 h-3.5 w-3.5" />
                Customize
              </Button>
            </div>
            
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1">{character.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-white/80">
                  {getClassTitle(character.class)}
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  Level {character.level}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Experience</span>
                <span>{character.experience}/{character.experienceToNextLevel}</span>
              </div>
              <Progress 
                value={(character.experience / character.experienceToNextLevel) * 100} 
                className="h-2 bg-white/20" 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{character.streaks.current}</div>
                <div className="text-xs text-white/80">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{character.level}</div>
                <div className="text-xs text-white/80">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{character.achievements.unlocked}</div>
                <div className="text-xs text-white/80">Achievements</div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Character Tabs */}
        <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="items">Inventory</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <Card className="p-4 mb-6">
              <h2 className="font-semibold mb-4">Character Stats</h2>
              
              <div className="space-y-4">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                          {getStatIcon(stat)}
                        </div>
                        <span className="capitalize">{stat}</span>
                      </div>
                      <span className="font-semibold">{value}/10</span>
                    </div>
                    <Progress value={value * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Stat Bonuses</h2>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Strength:</span>{' '}
                  <span className="text-muted-foreground">Increases effectiveness of physical workouts</span>
                </p>
                <p>
                  <span className="font-medium">Endurance:</span>{' '}
                  <span className="text-muted-foreground">Improves recovery and stamina</span>
                </p>
                <p>
                  <span className="font-medium">Mindfulness:</span>{' '}
                  <span className="text-muted-foreground">Enhances focus and mental clarity</span>
                </p>
                <p>
                  <span className="font-medium">Nutrition:</span>{' '}
                  <span className="text-muted-foreground">Boosts health benefits from good eating</span>
                </p>
                <p>
                  <span className="font-medium">Rest:</span>{' '}
                  <span className="text-muted-foreground">Improves sleep quality and rejuvenation</span>
                </p>
                <p>
                  <span className="font-medium">Willpower:</span>{' '}
                  <span className="text-muted-foreground">Increases resistance to habit breaking</span>
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="items">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Inventory ({character.inventory.items.length} items)</h2>
              <div className="flex items-center text-amber-500">
                <FaCoins className="mr-1 h-4 w-4" />
                <span className="font-medium">{character.inventory.coins} coins</span>
              </div>
            </div>
            
            <Card className="p-4 mb-6">
              <h3 className="font-semibold mb-4">Equipped Items</h3>
              
              <div className="space-y-3">
                {Object.entries(character.equipmentSlots).filter(([_, item]) => item).map(([slot, item]) => (
                  item && (
                    <div key={slot} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <img src={item.imageUrl} alt={item.name} className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <span className={`ml-2 text-xs ${getRarityColor(item.rarity)}`}>
                              ({item.rarity})
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        Unequip
                      </Button>
                    </div>
                  )
                ))}
                
                {Object.values(character.equipmentSlots).filter(item => item).length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No items equipped. Equip items to enhance your stats!
                  </p>
                )}
              </div>
            </Card>
            
            <Card className="p-4 mb-6">
              <h3 className="font-semibold mb-4">Inventory Items</h3>
              
              <div className="space-y-3">
                {character.inventory.items.filter(item => !item.equipped).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <img src={item.imageUrl} alt={item.name} className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          <span className={`ml-2 text-xs ${getRarityColor(item.rarity)}`}>
                            ({item.rarity})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      Equip
                    </Button>
                  </div>
                ))}
                
                {character.inventory.items.filter(item => !item.equipped).length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Your inventory is empty. Complete quests to earn items!
                  </p>
                )}
              </div>
            </Card>
            
            <Button 
              className="w-full" 
              onClick={() => router.push('/store')}
            >
              <FaStore className="mr-2 h-4 w-4" />
              Visit Store
            </Button>
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Achievements</h2>
              <div className="text-sm text-muted-foreground">
                {character.achievements.unlocked}/{character.achievements.total} Unlocked
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round((character.achievements.unlocked / character.achievements.total) * 100)}%</span>
              </div>
              <Progress 
                value={(character.achievements.unlocked / character.achievements.total) * 100} 
                className="h-2" 
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => router.push('/achievements')}
            >
              <FaTrophy className="mr-2 h-4 w-4" />
              View All Achievements
            </Button>
          </TabsContent>
        </Tabs>
        
        <Card className="p-6 bg-primary text-white">
          <h3 className="font-semibold mb-2">Level Up Faster</h3>
          <p className="text-sm opacity-90 mb-4">
            Complete daily quests, maintain streaks, and upgrade your character to advance through levels and unlock new rewards!
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/quests')}>
            Browse Available Quests
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CharacterPage; 