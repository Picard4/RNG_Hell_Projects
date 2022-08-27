using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;

// I watched this for array lists https://www.youtube.com/watch?v=RqR1O_y1R3E
// Other sources https://www.programiz.com/csharp-programming/foreach-loop
namespace Game
{
    class Program
    {
        // player characters
        const char NormalChar = 'L';
        const char ShieldChar = '0';
        const char LeftChar = '{';
        const char RightChar = '}';
        const char UpChar = '^';
        const char DownChar = 'v';
        // Player indicates the main character. Remove is meant to clear space.
        static char PlayerChar = NormalChar;          
        static char RemoveChar = ' ';
        static int PlayerX = 0;
        static int PlayerY = 25;
        static int MySpeed = 1;
        static int RemoveX;
        static int RemoveY;
        const int upSpeed = 2;
        // sets borders to stop crashing
        const int BorderHeight = 49;
        const int BorderWidth = 150;
        const int EmptyHeight = 10;
        const int EmptyWidth = 1;
        // enemies
        static ArrayList Enemy = new ArrayList(); // The array list will spawn enemies, with the EnemyXAxis and YAxis being the real danger
        static int [] EnemyXAxis = new int[20];
        static int[] EnemyYAxis = new int[20];
        static int EnemyY = 1;
        static int EnemyX;
        static bool EnemyPlace = false;
        static char EnemyChar = 'O';
        const int EnemyGone = BorderHeight - 2;
        // player attack
        static char PlayerAttackChar = '#';
        static int[] PlayerAttackX = new int[20];
        static int[] PlayerAttackY = new int[20];
        static bool Shield;
        static int ShieldOut;
        // Player Attack Calculations
        const int HiddenRemoveY = 49;
        const int easyHit = 2;
        // enemy attack
        static char EnemyAttackChar = '@';
        static int[] EnemyRightXAxis = new int[5];
        static int[] EnemyRightYAxis = new int[5];
        static int[] EnemyUpXAxis = new int[5];
        static int[] EnemyUpYAxis = new int[5];
        static int[] EnemyDownXAxis = new int[5];
        static int[] EnemyDownYAxis = new int[5];
        static int[] EnemyLeftXAxis = new int[5];
        static int[] EnemyLeftYAxis = new int[5];
        static bool BulletPlace = false;
        const int OffBullet = YBorder + 4;
        // item
        static char Item = '+';
        static int ItemX;
        static int ItemY;
        const int ItemGone = -1;
        static bool itemPlace = false;
        const int ItemLoss = 150;
        // stats
        static int HP;
        static int Score = 0;
        static bool EasyMode = false;
        static bool ItemGet = false;
        static int Loss = 1;
        static string AttackType = "None";
        static int HitRate; // determines the chances of attacks working. Altered upon each attack's activation
        static int SpaceCount = 0;
        const int MaxHit = 100;
        // borders
        const int YBorder = BorderHeight - 9;
        const int XBorder = BorderWidth - 1;
        // highest scores possible. If earned they end the game. Due to the point structure it's impossible to get the item max score without the item, so no premature Game Overs are possible by score.
        const int MaxScore = 2000;
        const int MaxItemScore = 1850;
        const int ScoreSpeed = 1400;
        const int ScoreKill = 100;
        // display setup
        static char DisplayChar = '/';
        static bool DisplayForm = false;

        // functions are in an incredibly messed up order. Sorry about that
        static void Main(string[] args)
        {
            // variable declaration
            ConsoleKey k;
            bool gameover = false;
            int choice;
            Int32 enemycounter = 0; // taken from notes to slow bullets
            Int32 enemyinversespeed = 40; // the lower the number, the faster move the enemy moves
            Console.BackgroundColor = ConsoleColor.DarkRed;
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WindowHeight = BorderHeight;
            Console.WindowWidth = BorderWidth;
            choice = titleScreen();
            if (choice == 1)
            {
              while (!gameover)
              {
                k = userInput();

                move(k);

                mydraw();

                if (Score >= ScoreSpeed)
                {
                    enemyinversespeed = 10;
                }

                // enemy bullets slowed through help from the notes
                if ((enemycounter % enemyinversespeed) == 0)
                {
                    enemyshoot();
                }
                enemycounter = enemycounter + 1;

                hitconfirm();

                if (HP <= 0 || Score == MaxItemScore || Score == MaxScore)
                {
                  gameover = true;
                  if (Loss != 3 && Loss != 4) // check the loss code at the game over function for full details on the numbers
                  {
                    Loss = 0;
                  }
                }
              }
            }
            Console.Clear();
            GameOver();
        } // end of main

        static void enemyshoot() // handles all data relating to bullet firing and reloading... I also could have simplified the loops. Whoops
        {
            // I also got in a bit of a panic trying to get respawning done so prepare for pointless failsafe code...
            int bulletTracker = 0;
            int bulletSpawn;
            Random bulletRNG = new Random();

            // left bullets
            while (bulletTracker < EnemyLeftXAxis.Length)
            {
                if (BulletPlace == false || EnemyLeftYAxis[bulletTracker] == OffBullet || EnemyLeftXAxis[bulletTracker] < 0)
                {
                    // spawns bullets
                    bulletSpawn = bulletRNG.Next(0, EnemyYAxis.Length); // places bullet near a random enemy
                    if (EnemyYAxis[bulletSpawn] != EnemyGone && EnemyXAxis[bulletSpawn] != BorderWidth - 1 && EnemyYAxis[bulletSpawn] < YBorder)
                    {
                        EnemyLeftXAxis[bulletTracker] = EnemyXAxis[bulletSpawn] - 1;
                        EnemyLeftYAxis[bulletTracker] = EnemyYAxis[bulletSpawn];
                        Console.SetCursorPosition(EnemyLeftXAxis[bulletTracker], EnemyLeftYAxis[bulletTracker]);
                        Console.Write(EnemyAttackChar);
                    }
                    BulletPlace = true;
                }
                // moves bullets and necessary hitboxes + remove.
                if (EnemyLeftYAxis[bulletTracker] != OffBullet)
                {
                    if (EnemyLeftXAxis[bulletTracker] >= 0)
                    {
                        Console.SetCursorPosition(EnemyLeftXAxis[bulletTracker], EnemyLeftYAxis[bulletTracker]);
                        Console.Write(RemoveChar);
                    }
                    EnemyLeftXAxis[bulletTracker] = EnemyLeftXAxis[bulletTracker] - 1;
                    for (int enemyTrack = 0; enemyTrack < EnemyXAxis.Length; enemyTrack++)
                    {
                        if (EnemyLeftXAxis[bulletTracker] >= 0 && EnemyLeftXAxis[bulletTracker] != EnemyYAxis[enemyTrack])
                        {
                            Console.SetCursorPosition(EnemyLeftXAxis[bulletTracker], EnemyLeftYAxis[bulletTracker]);
                            Console.Write(EnemyAttackChar);
                        }
                    }
                }
                // failsafe code for the display
                if (EnemyLeftYAxis[bulletTracker] == YBorder)
                {
                    Console.SetCursorPosition(EnemyLeftXAxis[bulletTracker], EnemyLeftYAxis[bulletTracker]);
                    Console.Write(DisplayChar);
                }
                bulletTracker = bulletTracker + 1;
            }

            //up bullets
            bulletTracker = 0;
            while (bulletTracker < EnemyUpXAxis.Length)
            {
                if (BulletPlace == false || EnemyUpYAxis[bulletTracker] < 0 || EnemyUpYAxis[bulletTracker] == OffBullet)
                {
                    // spawns bullets
                    bulletSpawn = bulletRNG.Next(0, EnemyYAxis.Length); // places bullet near a random enemy
                    if (EnemyYAxis[bulletSpawn] != EnemyGone && EnemyYAxis[bulletSpawn] < YBorder)
                    {
                        EnemyUpXAxis[bulletTracker] = EnemyXAxis[bulletSpawn];
                        EnemyUpYAxis[bulletTracker] = EnemyYAxis[bulletSpawn] - 1;
                        Console.SetCursorPosition(EnemyUpXAxis[bulletTracker], EnemyUpYAxis[bulletTracker]);
                        Console.Write(EnemyAttackChar);
                    }
                    BulletPlace = true;
                }
                // moves bullets and necessary hitboxes + remove.
                if (EnemyUpYAxis[bulletTracker] != OffBullet)
                {
                    if (EnemyUpYAxis[bulletTracker] >= 0)
                    {
                        Console.SetCursorPosition(EnemyUpXAxis[bulletTracker], EnemyUpYAxis[bulletTracker]);
                        Console.Write(RemoveChar);
                    }
                    EnemyUpYAxis[bulletTracker] = EnemyUpYAxis[bulletTracker] - 1;
                    for (int enemyTrack = 0; enemyTrack < EnemyXAxis.Length; enemyTrack++)
                    {
                        if (EnemyUpYAxis[bulletTracker] >= 0 && EnemyUpYAxis[bulletTracker] != EnemyYAxis[enemyTrack] && EnemyUpYAxis[bulletTracker] < YBorder)
                        {
                            Console.SetCursorPosition(EnemyUpXAxis[bulletTracker], EnemyUpYAxis[bulletTracker]);
                            Console.Write(EnemyAttackChar);
                        }
                    }
                }
                // failsafe code for the display
                if (EnemyUpYAxis[bulletTracker] == YBorder)
                {
                    Console.SetCursorPosition(EnemyUpXAxis[bulletTracker], EnemyUpYAxis[bulletTracker]);
                    Console.Write(DisplayChar);
                }
                bulletTracker = bulletTracker + 1;
            }

            //down bullets
            bulletTracker = 0;
            while (bulletTracker < EnemyDownXAxis.Length)
            {
                if (BulletPlace == false || EnemyDownYAxis[bulletTracker] >= YBorder || EnemyDownYAxis[bulletTracker] == OffBullet)
                {
                    // spawns bullets
                    bulletSpawn = bulletRNG.Next(0, EnemyYAxis.Length); // places bullet near a random enemy
                    if (EnemyYAxis[bulletSpawn] != EnemyGone && EnemyYAxis[bulletSpawn] != YBorder - 1 && EnemyYAxis[bulletSpawn] < YBorder)
                    {
                        EnemyDownXAxis[bulletTracker] = EnemyXAxis[bulletSpawn];
                        EnemyDownYAxis[bulletTracker] = EnemyYAxis[bulletSpawn] + 1;
                        Console.SetCursorPosition(EnemyDownXAxis[bulletTracker], EnemyDownYAxis[bulletTracker]);
                        Console.Write(EnemyAttackChar);
                    }
                    BulletPlace = true;
                }
                // moves bullets and necessary hitboxes + remove.
                if (EnemyDownYAxis[bulletTracker] != OffBullet)
                {
                    if (EnemyDownYAxis[bulletTracker] < YBorder)
                    {
                        Console.SetCursorPosition(EnemyDownXAxis[bulletTracker], EnemyDownYAxis[bulletTracker]);
                        Console.Write(RemoveChar);
                    }
                    EnemyDownYAxis[bulletTracker] = EnemyDownYAxis[bulletTracker] + 1;
                    for (int enemyTrack = 0; enemyTrack < EnemyXAxis.Length; enemyTrack++)
                    {
                        if (EnemyDownYAxis[bulletTracker] < YBorder && EnemyDownYAxis[bulletTracker] != EnemyYAxis[enemyTrack] && EnemyDownYAxis[bulletTracker] < YBorder)
                        {
                            Console.SetCursorPosition(EnemyDownXAxis[bulletTracker], EnemyDownYAxis[bulletTracker]);
                            Console.Write(EnemyAttackChar);
                        }
                    }
                }
                // failsafe code for the display
                if (EnemyDownYAxis[bulletTracker] == YBorder)
                {
                    Console.SetCursorPosition(EnemyDownXAxis[bulletTracker], EnemyDownYAxis[bulletTracker]);
                    Console.Write(DisplayChar);
                }
                bulletTracker = bulletTracker + 1;
            }
            bulletTracker = 0;

            //right bullets
            while (bulletTracker < EnemyRightXAxis.Length)
            {
                if (BulletPlace == false || EnemyRightXAxis[bulletTracker] > BorderWidth || EnemyRightYAxis[bulletTracker] == OffBullet)
                {
                    // spawns bullets
                    bulletSpawn = bulletRNG.Next(0, EnemyYAxis.Length); // places bullet near a random enemy
                    if (EnemyYAxis[bulletSpawn] != EnemyGone && EnemyXAxis[bulletSpawn] != BorderWidth - 1 && EnemyYAxis[bulletSpawn] < YBorder)
                    {
                        EnemyRightXAxis[bulletTracker] = EnemyXAxis[bulletSpawn] + 1;
                        EnemyRightYAxis[bulletTracker] = EnemyYAxis[bulletSpawn];
                        Console.SetCursorPosition(EnemyRightXAxis[bulletTracker], EnemyRightYAxis[bulletTracker]);
                        Console.Write(EnemyAttackChar);
                    }
                    BulletPlace = true;
                }
                // moves bullets and necessary hitboxes + remove.
                if (EnemyRightYAxis[bulletTracker] != OffBullet)
                {
                    if (EnemyRightXAxis[bulletTracker] < BorderWidth)
                    {
                        Console.SetCursorPosition(EnemyRightXAxis[bulletTracker], EnemyRightYAxis[bulletTracker]);
                        Console.Write(RemoveChar);
                    }
                    EnemyRightXAxis[bulletTracker] = EnemyRightXAxis[bulletTracker] + 1;
                    for (int enemyTrack = 0; enemyTrack < EnemyXAxis.Length; enemyTrack++)
                    {
                        if (EnemyRightXAxis[bulletTracker] < BorderWidth && EnemyRightXAxis[bulletTracker] != EnemyXAxis[enemyTrack] && EnemyLeftYAxis[bulletTracker] < YBorder)
                        {
                            Console.SetCursorPosition(EnemyRightXAxis[bulletTracker], EnemyRightYAxis[bulletTracker]);
                            Console.Write(EnemyAttackChar);
                        }
                    }
                }
                // failsafe code for the display
                if (EnemyRightYAxis[bulletTracker] == YBorder)
                {
                    Console.SetCursorPosition(EnemyRightXAxis[bulletTracker], EnemyRightYAxis[bulletTracker]);
                    Console.Write(DisplayChar);
                }
                bulletTracker = bulletTracker + 1;
            }
            // more failsafe code
            RemoveX = 0;
            RemoveY = OffBullet;
        } // end of enemyShoot

        static void hitconfirm() // verifies hit detection for everything
        {
            int hitCounter;
            int attackScan = 0;
            Random EnemyRNG = new Random();
            int enemyDead;
            int bulletTracker = 0;

            // player - item
            if (PlayerX == ItemX && PlayerY == ItemY)
            {
                ItemGet = true;
                RemoveItem();
            }

            // enemy bullet - player
            // due to the nature of how bullets move and how hit detection is handled with bullets, no use of RemoveChar is necessary
            // right bullets
            for (int bulletTrack = 0; bulletTrack < EnemyRightYAxis.Length; bulletTrack++)
            {
                if (EnemyRightXAxis[bulletTrack] == PlayerX && EnemyRightYAxis[bulletTrack] == PlayerY && Shield == false)
                {
                    enemyDead = EnemyRNG.Next(0, (HP + 1)); // random chance of killing the player instantly. The lower the HP the higher the chance. Set to +1 to avoid guaranteed kills at 2 HP
                    if (!EasyMode && enemyDead == 0 && HP != 1) // More RNG to troll the player
                    {
                        HP = 0;
                        Loss = 3;
                    }
                    else
                    {
                        HP = HP - 1;
                        // the player is thrown to a random position (and may be hit with a combo) :) 
                        PlayerX = EnemyRNG.Next(0, BorderWidth);
                        PlayerY = EnemyRNG.Next(0, YBorder);
                        // The bullet will keep going
                    }
                }
            }
            // up bullets
            for (int bulletTrack = 0; bulletTrack < EnemyUpYAxis.Length; bulletTrack++)
            {
                if (EnemyUpXAxis[bulletTrack] == PlayerX && EnemyUpYAxis[bulletTrack] == PlayerY && Shield == false)
                {
                    enemyDead = EnemyRNG.Next(0, (HP + 1)); // random chance of killing the player instantly. The lower the HP the higher the chance. Set to +1 to avoid guaranteed kills at 2 HP
                    if (!EasyMode && enemyDead == 0 && HP != 1) // More RNG to troll the player
                    {
                        HP = 0;
                        Loss = 3;
                    }
                    else
                    {
                        HP = HP - 1;
                        // the player is thrown to a random position (and may be hit with a combo) :) 
                        PlayerX = EnemyRNG.Next(0, BorderWidth);
                        PlayerY = EnemyRNG.Next(0, YBorder);
                        // The bullet will keep going
                    }
                }
            }
            // down bullets
            for (int bulletTrack = 0; bulletTrack < EnemyDownYAxis.Length; bulletTrack++)
            {
                if (EnemyDownXAxis[bulletTrack] == PlayerX && EnemyDownYAxis[bulletTrack] == PlayerY && Shield == false)
                {
                    enemyDead = EnemyRNG.Next(0, (HP + 1)); // random chance of killing the player instantly. The lower the HP the higher the chance. Set to +1 to avoid guaranteed kills at 2 HP
                    if (!EasyMode && enemyDead == 0 && HP != 1) // More RNG to troll the player
                    {
                        HP = 0;
                        Loss = 3;
                    }
                    else
                    {
                        HP = HP - 1;
                        // the player is thrown to a random position (and may be hit with a combo) :) 
                        PlayerX = EnemyRNG.Next(0, BorderWidth);
                        PlayerY = EnemyRNG.Next(0, YBorder);
                        // The bullet will keep going
                    }
                }
            }
            // left bullets
            for (int bulletTrack = 0; bulletTrack < EnemyLeftYAxis.Length; bulletTrack++)
            {
                if (EnemyLeftXAxis[bulletTrack] == PlayerX && EnemyLeftYAxis[bulletTrack] == PlayerY && Shield == false)
                {
                    enemyDead = EnemyRNG.Next(0, (HP + 1)); // random chance of killing the player instantly. The lower the HP the higher the chance
                    if (!EasyMode && enemyDead == 0 && HP != 1) // More RNG to troll the player
                    {
                        HP = 0;
                        Loss = 3;
                    }
                    else
                    {
                        HP = HP - 1;
                        // the player is thrown to a random position (and may be hit with a combo) :) 
                        PlayerX = EnemyRNG.Next(0, BorderWidth);
                        PlayerY = EnemyRNG.Next(0, YBorder);
                        // The bullet will keep going
                    }
                }
            }

            // Player vs enemy attack
            for (int bulletClash = 0; bulletClash < PlayerAttackX.Length; bulletClash++)
            {
                // Player vs Player attack
                if (PlayerAttackX[bulletClash] == PlayerX && PlayerAttackY[bulletClash] == PlayerY)
                {
                    attackScan = 0;
                    while (attackScan < PlayerAttackX.Length)
                    {
                        RemoveX = PlayerAttackX[attackScan];
                        RemoveY = PlayerAttackY[attackScan];
                        Console.SetCursorPosition(RemoveX, RemoveY);
                        Console.Write(RemoveChar);
                        PlayerAttackX[attackScan] = 0;
                        PlayerAttackY[attackScan] = BorderHeight - 1;
                        attackScan = attackScan + 1;
                    }
                }
                
                // Now back to your regularly scheduled programming
                // left bullets
                for (int bulletTrack = 0; bulletTrack < EnemyLeftXAxis.Length; bulletTrack++)
                {
                    if (PlayerAttackX[bulletClash] == EnemyLeftXAxis[bulletTrack] && PlayerAttackY[bulletClash] == EnemyLeftYAxis[bulletTrack])
                    {
                        EnemyLeftXAxis[bulletTrack] = 0;
                        EnemyLeftYAxis[bulletTrack] = OffBullet;
                        while (attackScan < PlayerAttackX.Length)
                        {
                            RemoveX = PlayerAttackX[attackScan];
                            RemoveY = PlayerAttackY[attackScan];
                            Console.SetCursorPosition(RemoveX, RemoveY);
                            Console.Write(RemoveChar);
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                            attackScan = attackScan + 1;
                        }
                        attackScan = 0;
                    }
                }

                // up bullets
                for (int bulletTrack = 0; bulletTrack < EnemyUpXAxis.Length; bulletTrack++)
                {
                    if (PlayerAttackX[bulletClash] == EnemyUpXAxis[bulletTrack] && PlayerAttackY[bulletClash] == EnemyUpYAxis[bulletTrack])
                    {
                        EnemyUpXAxis[bulletTrack] = 0;
                        EnemyUpYAxis[bulletTrack] = OffBullet;
                        while (attackScan < PlayerAttackX.Length)
                        {
                            RemoveX = PlayerAttackX[attackScan];
                            RemoveY = PlayerAttackY[attackScan];
                            Console.SetCursorPosition(RemoveX, RemoveY);
                            Console.Write(RemoveChar);
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                            attackScan = attackScan + 1;
                        }
                        attackScan = 0;
                    }
                }

                // down bullets
                for (int bulletTrack = 0; bulletTrack < EnemyDownXAxis.Length; bulletTrack++)
                {
                    if (PlayerAttackX[bulletClash] == EnemyDownXAxis[bulletTrack] && PlayerAttackY[bulletClash] == EnemyDownYAxis[bulletTrack])
                    {
                        EnemyDownXAxis[bulletTrack] = 0;
                        EnemyDownYAxis[bulletTrack] = OffBullet;
                        while (attackScan < PlayerAttackX.Length)
                        {
                            RemoveX = PlayerAttackX[attackScan];
                            RemoveY = PlayerAttackY[attackScan];
                            Console.SetCursorPosition(RemoveX, RemoveY);
                            Console.Write(RemoveChar);
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                            attackScan = attackScan + 1;
                        }
                        attackScan = 0;
                    }
                }

                // right bullets
                for (int bulletTrack = 0; bulletTrack < EnemyRightXAxis.Length; bulletTrack++)
                {
                    if (PlayerAttackX[bulletClash] == EnemyRightXAxis[bulletTrack] && PlayerAttackY[bulletClash] == EnemyRightYAxis[bulletTrack])
                    {
                        EnemyRightXAxis[bulletTrack] = 0;
                        EnemyRightYAxis[bulletTrack] = OffBullet;
                        while (attackScan < PlayerAttackX.Length)
                        {
                            RemoveX = PlayerAttackX[attackScan];
                            RemoveY = PlayerAttackY[attackScan];
                            Console.SetCursorPosition(RemoveX, RemoveY);
                            Console.Write(RemoveChar);
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                            attackScan = attackScan + 1;
                        }
                        attackScan = 0;
                    }
                }
            }

            // enemy based detection in the loop
            for (hitCounter = 0; hitCounter < EnemyXAxis.Length; hitCounter++)
            {
                // Player - enemy
                if (EnemyXAxis[hitCounter] == PlayerX && EnemyYAxis[hitCounter] == PlayerY)
                {
                    enemyDead = EnemyRNG.Next(0, (HP + 1)); // random chance of killing the player instantly. The lower the HP the higher the chance. Set to +1 to avoid guaranteed kills at 2 HP
                    if (!EasyMode && enemyDead == 0 && HP != 1) // More RNG to troll the player
                    {
                        HP = 0;
                        Loss = 3;
                    }
                    else
                    {
                        HP = HP - 1;
                        Console.SetCursorPosition(PlayerX, PlayerY); // replaces the player's character with the enemy, removing a graphical bug.
                        Console.Write(EnemyChar);
                        // the player is thrown to the starting position :)
                        PlayerX = 0;
                        PlayerY = 25;
                    }
                }

                // remove - enemy (just in case)
                if (RemoveX == EnemyXAxis[hitCounter] && RemoveY == EnemyYAxis[hitCounter])
                {
                    Console.SetCursorPosition(RemoveX, RemoveY);
                    Console.Write(EnemyChar);
                }

                // bullet - enemy
                for (int enemyShot = 0; enemyShot < EnemyRightXAxis.Length; enemyShot++)
                {
                    // right
                    if (EnemyRightXAxis[enemyShot] == EnemyXAxis[hitCounter] && EnemyRightYAxis[enemyShot] == EnemyYAxis[hitCounter])
                    {
                        EnemyRightYAxis[enemyShot] = OffBullet;
                        Console.SetCursorPosition(EnemyXAxis[hitCounter], EnemyYAxis[hitCounter]);
                        Console.Write(EnemyChar);
                    }

                    // up
                    if (EnemyUpXAxis[enemyShot] == EnemyXAxis[hitCounter] && EnemyUpYAxis[enemyShot] == EnemyYAxis[hitCounter])
                    {
                        EnemyUpYAxis[enemyShot] = OffBullet;
                        Console.SetCursorPosition(EnemyXAxis[hitCounter], EnemyYAxis[hitCounter]);
                        Console.Write(EnemyChar);
                    }
                    // down
                    if (EnemyDownXAxis[enemyShot] == EnemyXAxis[hitCounter] && EnemyDownYAxis[enemyShot] == EnemyYAxis[hitCounter])
                    {
                        EnemyDownYAxis[enemyShot] = OffBullet;
                        Console.SetCursorPosition(EnemyXAxis[hitCounter], EnemyYAxis[hitCounter]);
                        Console.Write(EnemyChar);
                    }
                    // left
                    if (EnemyLeftXAxis[enemyShot] == EnemyXAxis[hitCounter] && EnemyLeftYAxis[enemyShot] == EnemyYAxis[hitCounter])
                    {
                        EnemyLeftYAxis[enemyShot] = OffBullet;
                        Console.SetCursorPosition(EnemyXAxis[hitCounter], EnemyYAxis[hitCounter]);
                        Console.Write(EnemyChar);
                    }
                }

                // Playerattack - enemy
                for (attackScan = 0; attackScan < EnemyXAxis.Length; attackScan++)
                {
                    if (PlayerAttackX[attackScan] == EnemyXAxis[hitCounter] && PlayerAttackY[attackScan] == EnemyYAxis[hitCounter])
                    {
                        enemyDead = EnemyRNG.Next(1, 101); // rolls a number between 1 and 100. This number is then compared to the hit rate to see if the attack will actually work
                        // hit rates add more RNG to trying to kill enemies
                        if (enemyDead <= HitRate)
                        {
                            Score = Score + ScoreKill;
                            RemoveX = EnemyXAxis[hitCounter];
                            RemoveY = EnemyYAxis[hitCounter];
                            EnemyXAxis[hitCounter] = 0;
                            EnemyYAxis[hitCounter] = EnemyGone;
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                        }
                        else
                        {
                            PlayerAttackX[attackScan] = 0;
                            PlayerAttackY[attackScan] = BorderHeight - 1;
                            Console.SetCursorPosition(EnemyXAxis[hitCounter], EnemyYAxis[hitCounter]);
                            Console.Write(EnemyChar);
                        }
                    }

                    // PlayerAttack - Item
                    if (PlayerAttackY[attackScan] == ItemY && PlayerAttackX[attackScan] == ItemX)
                    {
                        itemPlace = false;
                    }
                }
            }

            // EnemyBullets - Item
            while (bulletTracker < EnemyRightXAxis.Length)
            {
                if (EnemyRightYAxis[bulletTracker] == ItemY && EnemyRightXAxis[bulletTracker] == ItemX)
                {
                    EnemyRightYAxis[bulletTracker] = OffBullet;
                    Console.SetCursorPosition(ItemX, ItemY);
                    Console.Write(Item);
                }
                bulletTracker = bulletTracker + 1;
            }
            bulletTracker = 0;
            while (bulletTracker < EnemyUpXAxis.Length)
            {
                if (EnemyUpYAxis[bulletTracker] == ItemY && EnemyUpXAxis[bulletTracker] == ItemX)
                {
                    EnemyUpYAxis[bulletTracker] = OffBullet;
                    Console.SetCursorPosition(ItemX, ItemY);
                    Console.Write(Item);
                }
                bulletTracker = bulletTracker + 1;
            }
            bulletTracker = 0;
            while (bulletTracker < EnemyDownXAxis.Length)
            {
                if (EnemyDownYAxis[bulletTracker] == ItemY && EnemyDownXAxis[bulletTracker] == ItemX)
                {
                    EnemyDownYAxis[bulletTracker] = OffBullet;
                    Console.SetCursorPosition(ItemX, ItemY);
                    Console.Write(Item);
                }
                bulletTracker = bulletTracker + 1;
            }
            bulletTracker = 0;
            while (bulletTracker < EnemyLeftXAxis.Length)
            {
                if (EnemyLeftYAxis[bulletTracker] == ItemY && EnemyLeftXAxis[bulletTracker] == ItemX)
                {
                    EnemyLeftYAxis[bulletTracker] = OffBullet;
                    Console.SetCursorPosition(ItemX, ItemY);
                    Console.Write(Item);
                }
                bulletTracker = bulletTracker + 1;
            }

            // Shield expiration
            if (ShieldOut <= SpaceCount && Shield)
            {
                Shield = false;
                PlayerChar = NormalChar;
            }

        } // end of hitconfirm
        static void move(ConsoleKey k) // tells the system which direction to move the main character
        {
            int attackScan = 0;
            int walkDeath;
            int walkDead = 69;
            Random walkRNG = new Random();
            // copied partially from notes
            // space clear built in
            // each else statement includes a 1/100 chance of instant death for walking
            if (k == ConsoleKey.UpArrow)
            {
                if (PlayerY == 0)
                {
                    // blocks input to prevent a crash
                }
                else if (MySpeed == upSpeed && PlayerY == 1) // done to do limits for my item (+). Hard coding 1 was intentional
                {
                    PlayerY -= 1;
                    RemoveY = PlayerY + 1;
                    RemoveX = PlayerX;
                    SpaceCount = SpaceCount + 1;
                    if (!Shield)
                    {
                        PlayerChar = UpChar;
                    }
                    walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                    if (walkDeath == walkDead && EasyMode == false && Shield == false)
                    {
                        HP = 0;
                        Loss = 3;
                    }
                }
                else
                {
                    PlayerY -= MySpeed;
                    RemoveY = PlayerY + MySpeed;
                    RemoveX = PlayerX;
                    SpaceCount = SpaceCount + 1;
                    if (!Shield)
                    {
                        PlayerChar = UpChar;
                    }
                    walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                    if (walkDeath == walkDead && EasyMode == false && Shield == false)
                    {
                        HP = 0;
                        Loss = 3;
                    }
                }
            }

            if (k == ConsoleKey.DownArrow)
            {

              if (PlayerY == BorderHeight - EmptyHeight)
              {
                  // blocks input to prevent a crash
              }
              else if (MySpeed == upSpeed && PlayerY == BorderHeight - EmptyHeight - 1) // done to do limits for my item (+). Hard coding 1 was intentional
              {
                PlayerY += 1;
                RemoveY = PlayerY - 1;
                RemoveX = PlayerX;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = DownChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                  HP = 0;
                  Loss = 3;
                }
              }
              else
              {
                PlayerY += MySpeed;
                RemoveY = PlayerY - MySpeed;
                RemoveX = PlayerX;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = DownChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                    HP = 0;
                    Loss = 3;
                }
              }
            }

            if (k == ConsoleKey.RightArrow)
            {
              if (PlayerX == BorderWidth - EmptyWidth)
              {
                  // blocks input to prevent a crash
              }
              else if (MySpeed == upSpeed && PlayerX == BorderWidth - EmptyWidth - 1) // done to do limits for my item (+). Hard coding 1 was intentional
              {
                PlayerX += 1;
                RemoveX = PlayerX - 1;
                RemoveY = PlayerY;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = RightChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                    Loss = 3;
                    HP = 0;
                }
              }
              else
              {
                PlayerX += MySpeed;
                RemoveX = PlayerX - MySpeed;
                RemoveY = PlayerY;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = RightChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                    Loss = 3;
                    HP = 0;
                }
              }
            }

            if (k == ConsoleKey.LeftArrow)
            {
              if (PlayerX == 0)
              {
                // blocks input to prevent a crash
              }
              else if (MySpeed == upSpeed && PlayerX == 1) // done to do limits for my item (+). Hard coding 1 was intentional
              {
                PlayerX -= 1;
                RemoveX = PlayerX + 1;
                RemoveY = PlayerY;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = LeftChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                    HP = 0;
                    Loss = 3;
                }
              }
              else
              {
                PlayerX -= MySpeed;
                RemoveX = PlayerX + MySpeed;
                RemoveY = PlayerY;
                SpaceCount = SpaceCount + 1;
                if (!Shield)
                {
                    PlayerChar = LeftChar;
                }
                walkDeath = walkRNG.Next(1, 101); // 1 in 100 chance of killing the player instantly for each step they take
                if (walkDeath == walkDead && EasyMode == false && Shield == false)
                {
                    HP = 0;
                    Loss = 3;
                }
              }
            }
            // I'm going to pass my attacks to functions to avoid clutter since I'm programming 6 (really 5) of them
            if (k == ConsoleKey.Spacebar)
            {
                int attack;
                // add code here to despawn attacks
                Random AttackRNG = new Random();
                attack = AttackRNG.Next(0, 10); // pulls a random attack each time the Spacebar is pressed. More details below
                while (attackScan < PlayerAttackX.Length) // despawns old attacks
                {
                    RemoveX = PlayerAttackX[attackScan];
                    RemoveY = PlayerAttackY[attackScan];
                    Console.SetCursorPosition(RemoveX, RemoveY);
                    Console.Write(RemoveChar);
                    PlayerAttackX[attackScan] = 0;
                    PlayerAttackY[attackScan] = BorderHeight - 1;
                    attackScan = attackScan + 1;
                }
                // I had issues getting a switch statement to work, and by the time I had an idea of how to fix it I had this setup ready
                if (attack == 9)
                {
                    shieldattack();
                }
                else if (attack == 1 || attack == 2)
                {
                    rightattack();
                }
                else if (attack == 3 || attack == 4)
                {
                    downattack();
                }
                else if (attack == 5 || attack == 6)
                {
                    upattack();
                }
                else if (attack == 7 || attack == 8)
                {
                    leftattack();
                }
                else // the only other option is attack being 0 but I felt like trolling for a failsafe
                {
                    painattack();
                }
                // 9 summons a shield
                // 0 damages the player (-1 HP)
                // 1 or 2 will do a short range attack to the right
                // 3 or 4 will do an attack down
                // 5 or 6 will do an attack up
                // 7 or 8 will do an attack left
            }

            // suicide button
            if (k == ConsoleKey.Escape)
            {
                HP = 0;
                Loss = 4;
            }

            // item speed toggle
            if (k == ConsoleKey.X && ItemGet == true)
            {
                MySpeed = 1;
            }
            if (k == ConsoleKey.C && ItemGet == true)
            {
                MySpeed = 2;
            }

            // warping move
            if (k == ConsoleKey.Z)
            {
                int warpDead;
                Random warpRNG = new Random();
                if (EasyMode)
                {
                    if (ItemGet)
                    {
                        warpDead = warpRNG.Next(1, 13); // random chance of instantly killing the player to "balance" the risk of warping vs walking
                    }
                    else
                    {
                        warpDead = warpRNG.Next(1, 7); // random chance of instantly killing the player to "balance" the risk of warping vs walking
                    }
                }
                else
                {
                    if (ItemGet)
                    {
                        warpDead = warpRNG.Next(1, 7); // random chance of instantly killing the player to "balance" the risk of warping vs walking
                    }
                    else
                    {
                        warpDead = warpRNG.Next(1, 4); // random chance of instantly killing the player to "balance" the risk of warping vs walking
                    }
                }
                // the warp instant kill is toned down if you get the item or activate easy mode
                if (warpDead == 1)
                {
                    HP = 0;
                    Loss = 3;
                }
                RemoveX = PlayerX;
                RemoveY = PlayerY;
                // warps the player to a random position
                PlayerX = warpRNG.Next(0, BorderWidth);
                PlayerY = warpRNG.Next(0, YBorder);
            }
        } // end of move
        
        // directional attacks ordered based on range. Short to long.
        static void rightattack()
        {
            int damageBorder = 150;
            // the right attack is 1 tile long, so no range variable is needed
            PlayerAttackY[0] = PlayerY;
            PlayerAttackX[0] = PlayerX + 1;
            AttackType = "Right";
            HitRate = 60;
            if (EasyMode)
            {
                HitRate = HitRate * easyHit;
                if (HitRate >= MaxHit)
                {
                    HitRate = MaxHit;
                }
            }
            PlayerChar = RightChar;
            if (Shield)
            {
                PlayerChar = ShieldChar;
            }
            if (PlayerAttackX[0] >= damageBorder)
            {
                if (Shield == false)
                {
                    HP = HP - 1;
                }
                PlayerAttackX[0] = 0;
                PlayerAttackY[0] = BorderHeight - 1;
            }
            else
            {
                Console.SetCursorPosition(PlayerAttackX[0], PlayerAttackY[0]);
                Console.Write(PlayerAttackChar);
                RemoveY = HiddenRemoveY;
                RemoveX = 1;
            }
        } // end of rightattack
        static void downattack()
        {
            int attackWrite = 1;
            bool easyMiss = false;
            int attackRange = 11;
            HitRate = 20;
            if (EasyMode)
            {
                HitRate = HitRate * easyHit;
                if (HitRate >= MaxHit)
                {
                    HitRate = MaxHit;
                }
            }
            AttackType = "Down";
            while (attackWrite < attackRange)
            {
                PlayerAttackY[attackWrite] = PlayerY + attackWrite;
                PlayerAttackX[attackWrite] = PlayerX;
                if (PlayerAttackY[attackWrite] >= YBorder)
                {
                    if (Shield == false && easyMiss == false)
                    {
                        HP = HP - 1;
                        if (EasyMode)
                        {
                            easyMiss = true;
                        }
                    }
                    PlayerAttackX[attackWrite] = 0;
                    PlayerAttackY[attackWrite] = BorderHeight - 1;
                }
                else
                {
                    Console.SetCursorPosition(PlayerAttackX[attackWrite], PlayerAttackY[attackWrite]);
                    Console.Write(PlayerAttackChar);
                    RemoveY = HiddenRemoveY;
                    RemoveX = 1;
                }
                PlayerChar = DownChar;
                if (Shield)
                {
                    PlayerChar = ShieldChar;
                }
                attackWrite = attackWrite + 1;
            }
        } // end of down attack
        static void upattack()
        {
            int attackWrite = 1;
            int attackRange = 4;
            bool easyMiss = false;
            HitRate = 40;
            if (EasyMode)
            {
                HitRate = HitRate * easyHit;
                if (HitRate >= MaxHit)
                {
                    HitRate = MaxHit;
                }
            }
            AttackType = "Up";
            while (attackWrite < attackRange)
            {
                PlayerAttackY[attackWrite] = PlayerY - attackWrite;
                PlayerAttackX[attackWrite] = PlayerX;
                if (PlayerAttackY[attackWrite] < 0)
                {
                    if (Shield == false && easyMiss == false)
                    {
                        HP = HP - 1;
                        if (EasyMode)
                        {
                            easyMiss = true;
                        }
                    }
                    PlayerAttackX[attackWrite] = 0;
                    PlayerAttackY[attackWrite] = BorderHeight - 1;
                }
                else
                {
                    Console.SetCursorPosition(PlayerAttackX[attackWrite], PlayerAttackY[attackWrite]);
                    Console.Write(PlayerAttackChar);
                    RemoveY = HiddenRemoveY;
                    RemoveX = 1;
                }
                PlayerChar = UpChar;
                if (Shield)
                {
                    PlayerChar = ShieldChar;
                }
                attackWrite = attackWrite + 1;
            }
        } // end of upattack
        static void leftattack()
        {
            int attackWrite = 1;
            int attackScanLeft = 0;
            bool easyMiss = false;
            HitRate = 10;
            if (EasyMode)
            {
                HitRate = HitRate * easyHit;
                if (HitRate >= MaxHit)
                {
                    HitRate = MaxHit;
                }
            }
            AttackType = "Left";
            while (attackScanLeft < PlayerAttackX.Length) // the left attack consumes the whole array, so no special indicator is needed
            {
                PlayerAttackY[attackScanLeft] = PlayerY;
                PlayerAttackX[attackScanLeft] = PlayerX - attackWrite;
                if (PlayerAttackX[attackScanLeft] < 0)
                {
                    if (Shield == false && easyMiss == false)
                    {
                        HP = HP - 1;
                        if (EasyMode)
                        {
                            easyMiss = true;
                        }
                    }
                    PlayerAttackX[attackScanLeft] = 0;
                    PlayerAttackY[attackScanLeft] = BorderHeight - 1;
                }
                else
                {
                    Console.SetCursorPosition(PlayerAttackX[attackScanLeft], PlayerAttackY[attackScanLeft]);
                    Console.Write(PlayerAttackChar);
                    RemoveY = HiddenRemoveY;
                    RemoveX = 1;
                }
                PlayerChar = LeftChar;
                if (Shield)
                {
                    PlayerChar = ShieldChar;
                }
                attackWrite = attackWrite + 1;
                attackScanLeft = attackScanLeft + 1;
            }
        } // end of leftattack
        static void shieldattack() // Activates shield
        // I originally planned to make this a strong decent range attack, but the introduction of bullets gliding got me worried about this game being a bullet hell on top of extreme RNG, so I brainstormed and added a shield
        {
            int easyShield = 2;
            int duration = 5;
            if (EasyMode)
            {
                duration = duration * easyShield;
            }
            Shield = true;
            PlayerChar = ShieldChar;
            AttackType = "Shield";
            HitRate = MaxHit;
            ShieldOut = SpaceCount + duration;
        } // end of shieldattack
        static void painattack() // -1 HP :)
        {
            HP = HP - 1;
            AttackType = "lol get rekt";
            HitRate = MaxHit;
            PlayerChar = NormalChar;
            if (Shield)
            {
                PlayerChar = ShieldChar;
            }
        } // end of painattack
        static void mydraw() // Places characters
        {
          int randomPlace;
          int displayDraw;
          int enemyCount = 20;
          int enemySpawn = 0;
          int rowCheck = 2;
          Random PlacementRNG = new Random();
          Console.SetCursorPosition(PlayerX, PlayerY);
          Console.CursorVisible = false;
          Console.ForegroundColor = ConsoleColor.Green; // improves visibility
          Console.Write(PlayerChar);
          Console.ForegroundColor = ConsoleColor.Yellow;
          Console.SetCursorPosition(RemoveX, RemoveY);
          Console.Write(RemoveChar);
          // Enemy Placement
          // enemies will always keep the same y axis. Their x axis is randomized.
          if (!EnemyPlace)
          {
              while (enemySpawn < enemyCount)
              {
                Enemy.Add(EnemyChar);
                EnemyX = PlacementRNG.Next(1, XBorder);
                Console.SetCursorPosition(EnemyX, EnemyY);
                Console.Write(Enemy[enemySpawn]);
                EnemyXAxis[enemySpawn] = EnemyX;
                EnemyYAxis[enemySpawn] = EnemyY;
                EnemyY = EnemyY + rowCheck;
                enemySpawn = enemySpawn + 1;
              }
              EnemyPlace = true;
          }

          // Item placement
          // Item will always keep the same y axis. Its x axis is randomized.
          while (!itemPlace)
          {
            ItemY = 0; // done to stop the item from hitting the player at the start
            randomPlace = PlacementRNG.Next(1, XBorder);
            ItemX = randomPlace;
            Console.SetCursorPosition(ItemX, ItemY);
            Console.Write(Item);
            itemPlace = true;
          }
          // Display drawing
          displayDraw = XBorder;
          Console.SetCursorPosition(displayDraw, YBorder);
          Console.Write(DisplayChar);
          while (!DisplayForm)
          {
            displayDraw -= 1;
            Console.SetCursorPosition(displayDraw, YBorder);
            Console.Write(DisplayChar);
            // hard coding is necessary as this is the display
            for (int VertForm = YBorder; VertForm <= BorderHeight; VertForm++)
            {
                Console.SetCursorPosition(37, VertForm);
                Console.Write(DisplayChar);
            }
            for (int VertForm = YBorder; VertForm <= BorderHeight; VertForm++)
            {
                Console.SetCursorPosition(74, VertForm);
                Console.Write(DisplayChar);
            }
            for (int VertForm = YBorder; VertForm <= BorderHeight; VertForm++)
            {
                Console.SetCursorPosition(111, VertForm);
                Console.Write(DisplayChar);
            }
            if (displayDraw == 0)
            {
              DisplayForm = true;
            }
          }
          statDisplay();
        } // end of mydraw

        static void statDisplay() // displays the player's statistics. HP, Their last attack and its hit rate, and their score.
        {
            int statTitleY = BorderHeight - 8;
            int statInfoY = BorderHeight - 6;
            // all stat titles created now
            // hard coding is necessary as this is the display
            Console.SetCursorPosition(15, statTitleY);
            Console.Write("Your HP");
            Console.SetCursorPosition(49, statTitleY);
            Console.Write("Your Score");
            Console.SetCursorPosition(85, statTitleY);
            Console.Write("Your Last Attack");
            Console.SetCursorPosition(120, statTitleY);
            Console.Write("Your Last Hit %");
            // all stats displayed here
            Console.SetCursorPosition(16, statInfoY);
            Console.Write(" ");
            Console.Write(HP + "  ");
            Console.SetCursorPosition(52, statInfoY);
            Console.Write(" ");
            Console.Write(Score + "    ");
            Console.SetCursorPosition(87, statInfoY);
            Console.Write(" ");
            Console.Write(AttackType + "          ");
            Console.SetCursorPosition(124, statInfoY);
            Console.Write(" ");
            Console.Write(HitRate + "%" + "  ");
        } // end of statDisplay
        static System.ConsoleKey userInput() // Takes the user's input
        {
            ConsoleKey k = ConsoleKey.NoName; //copied partially from notes
            if (Console.KeyAvailable)
            {
                k = Console.ReadKey(true).Key;
            }
            return k;
        } // end of userInput

        static int titleScreen()
        {
            int choice = 1; // I had issues getting my RNG to work with 0 and 1 and I kept rolling 1s when trying 1-2, so I made a 1/3 chance of the game starting
            Random MenuRNG = new Random();
            string forceStart;
            Console.Clear();
            Console.WriteLine(@"______ _   _ _____   _   _  _____ _      _     
| ___ \ \ | |  __ \ | | | ||  ___| |    | |    
| |_/ /  \| | |  \/ | |_| || |__ | |    | |    
|    /| . ` | | __  |  _  ||  __|| |    | |    
| |\ \| |\  | |_\ \ | | | || |___| |____| |____
\_| \_\_| \_/\____/ \_| |_/\____/\_____/\_____/
                                               
                                               "); //Source for title: http://patorjk.com/software/taag/#p=display&f=Doom&t=RNG%20HELL
            Console.WriteLine("Developed by Palmarino DiMarco to extract your sanity. Available since December 2019.");
            Console.WriteLine("Special Thanks to Larry Fagen along with everyone who playtested and gave me ideas :)");
            Console.WriteLine(" ");
            Console.WriteLine("INSTRUCTIONS");
            Console.WriteLine(" ");
            Console.WriteLine("THE BASICS");
            Console.WriteLine("Take the L and unleash random attacks to kill every last one of the enemies on the screen.");
            Console.WriteLine("Your starting coordinates are (0, 25). That's on the left side of the screen around the middle.");
            Console.WriteLine("L = You (You'll also turn into other characters but your color will always be green)");
            Console.WriteLine("O = Enemy");
            Console.WriteLine("# = Your Attack");
            Console.WriteLine("@ = Enemy Bullet");
            Console.WriteLine("+ = Item");
            Console.WriteLine(" ");
            Console.WriteLine("THE CONTROLS");
            Console.WriteLine("Use the arrow keys to move.");
            Console.WriteLine("Attack with the spacebar.");
            Console.WriteLine("Z teleports you to a random space. It's dangerous to use it.");
            Console.WriteLine("If you get the +, press C to double your speed and X to return to normal.");
            Console.WriteLine("Press Enter to confirm in menus.");
            Console.WriteLine("Press Esc to commit die.");
            Console.WriteLine(" ");
            Console.WriteLine("ATTACKS");
            Console.WriteLine("Shorter range attacks have higher hit rates.");
            Console.WriteLine("Right attack. Takes up a single tile. 2/10 chance.");
            Console.WriteLine("Up attack. Takes up 3 tiles. 2/10 chance.");
            Console.WriteLine("Down attack. Takes up 10 tiles. 2/10 chance.");
            Console.WriteLine("Left attack. Takes up 20 tiles. 2/10 chance.");
            Console.WriteLine("Shield attack. Turns you into '0', protects you from both forms of bullet damage and makes walking safer for a few steps. 1/10 chance.");
            Console.WriteLine("Mystery attack. Does a thing. 1/10 chance.");
            Console.WriteLine("If your attacks go out of range they will damage you badly (each lost bullet takes 1 HP). Position yourself correctly if you want to fight.");
            Console.WriteLine(" ");
            Console.WriteLine("TIPS");
            Console.WriteLine("Your attacks can randomly miss. Check the bottom of the screen to see the odds of your attacks working.");
            Console.WriteLine("Your attacks can stop enemy shots so long as you don't hit them first.");
            Console.WriteLine("Enemies cannot hit you at point blank range. (1 Tile).");
            Console.WriteLine("Tread carefully and watch out for insta-kills, teleportation upon getting hit, full screen and other examples of good game design.");
            Console.WriteLine("Pick up the + if you want to lower the danger, but it'll also lower the score...");
            Console.WriteLine(" ");
            Console.WriteLine("WELCOME TO A UNIQUE KIND OF HELL!");
            Console.WriteLine("If you're too scared of RNG and know the cheat code, enter it to activate Easy Mode. It also doubles some stats.");
            Console.WriteLine("Input something and press enter to have the game randomly Start or Game Over you."); //you can input "iamacritic" to start. This is to prank the player
            // time to convert forceStart to a string. iamacritic turns choice to 1. Otherwise choice is a 50-50 shot from 1-3 rng. Anything other than 1 starts gameover
            forceStart = Convert.ToString(Console.ReadLine());
            if (forceStart == "iamacritic")
            {
                Console.Clear();
                choice = 1;
                EasyMode = true;
                HP = 20;
                // Entering iamacritic also activates easy mode, which will tone down the excessive RNG.
            }
            else
            {
                Console.Clear();
                choice = MenuRNG.Next(1, 3); // 50% chance of killing the player instantly without easy mode. What a kind introduction!
                HP = 10;
            }
            return choice;
        } // end of titleScreen

        static void RemoveItem()
        {
            ItemX = ItemGone;
            ItemY = ItemGone;
            // Getting the item also lowers the score to create a risk/reward system
            Score = Score - ItemLoss;
        } // end of RemoveItem

        static void GameOver()
        {
            //Loss is meant to give a "special" message if the player is brought here by the title screen or if their score is deleted by RNG
            // if Loss arrived here as 0, the standard Game Over is made
            // if Loss arrived as 1, the player is mocked for losing before the game started
            // if Loss is turned into 2, the player is mocked for losing their score
            // if Loss is 3, the player is mocked for randomly getting OHKOed
            // if Loss = 4, the player is mocked for pressing the suicide button
            int scoreDelete;
            int RIPThirtyTwo = 32;
            int ThirtyTwo;
            Random ThirtyTwoRNG = new Random();
            String quitKey;
            Random ScoreDeleteRNG = new Random();
            scoreDelete = ScoreDeleteRNG.Next(0, 10); // random chance to delete the player's score. Altered based on easy mode and the item
            int deleteRNG = 4;
            int itemBuff = 1;
            Console.Clear();
            Console.Beep();
            Console.WriteLine(@" _____   ___  ___  ___ _____   _____  _   _ ___________ _ 
|  __ \ / _ \ |  \/  ||  ___| |  _  || | | |  ___| ___ \ |
| |  \// /_\ \| .  . || |__   | | | || | | | |__ | |_/ / |
| | __ |  _  || |\/| ||  __|  | | | || | | |  __||    /| |
| |_\ \| | | || |  | || |___  \ \_/ /\ \_/ / |___| |\ \|_|
 \____/\_| |_/\_|  |_/\____/   \___/  \___/\____/\_| \_(_)
                                                          
                                                          "); // same source as the title screen http://patorjk.com/software/taag/#p=display&f=Doom&t=GAME%20OVER!
            if (EasyMode)
            {
                deleteRNG *= 2;
                itemBuff *= 2;
            }
            if (ItemGet)
            {
                deleteRNG = deleteRNG + itemBuff;
            }
            // This message had to be displayed early to allow for the score to also be randomly deleted. I go the extra mile to ensure the pain of my player base
            if (Loss == 3)
            {
                Console.WriteLine("Congratulations you were somehow OHKOed n00b.");
                Loss = 0;
                // the standard 0 procedure happens for OHKOed players from here
            }
            if (Loss == 4)
            {
                Console.WriteLine("You died early as requested. Are you happy?");
            }
            //RNG to randomly delete the player's score just to ruin their day :). Odds of deleting are lower if easy mode is active or the item (+) was collected.
            if (Loss == 0 && scoreDelete >= deleteRNG)
            {
                Loss = 2;
            }
            // if loss is 2, say goodbye to that high score!
            // messages
            if (Score == MaxScore && Loss != 2 || Score == MaxItemScore && Loss != 2)
            {
                Console.WriteLine(@"__   _______ _   _   _    _  _____ _   _ _ ___  
\ \ / /  _  | | | | | |  | ||  _  | \ | | |__ \ 
 \ V /| | | | | | | | |  | || | | |  \| | |  ) |
  \ / | | | | | | | | |/\| || | | | . ` | | / / 
  | | \ \_/ / |_| | \  /\  /\ \_/ / |\  |_||_|  
  \_/  \___/ \___/   \/  \/  \___/\_| \_(_)(_)  
                                                
 "); // http://patorjk.com/software/taag/#p=display&f=Doom&t=YOU%20WON!%3F%0A%0A%0A%0A
            }
            if (Loss == 0)
            {
                Console.WriteLine("Your score is " + Score);
            }
            // Game Over messages
            if (Loss == 1)
            {
                Console.WriteLine("I can't believe you lost before the game even started.");
            }
            if (Loss == 2)
            {
                Score = 0;
                SpaceCount = 0;
                Console.WriteLine("Your score and spaces moved were randomly deleted. Have a nice day!");
            }
            if (Loss == 0 || Loss == 3)
            {
                Console.WriteLine("You moved " + SpaceCount + " times.");
            }
            //
            if (EasyMode == true)
            {
                Console.WriteLine("You were on easy mode git gud and play on normal next time.");
            }
            // Congratulations messages for anyone insane enough to win on normal
            if (Score == MaxItemScore && EasyMode == false)
            {
                Console.WriteLine("Real gamers don't grab the +");
            }
            if (Score == MaxScore && EasyMode == false)
            {
                Console.WriteLine("How did you survive!? You should probably consider quitting your job to gamble.");
            }
            Console.WriteLine("Press enter to exit.");
            quitKey = Convert.ToString(Console.ReadLine());
            ThirtyTwo = ThirtyTwoRNG.Next(1, 101); // 1 in 100 chance of making a delete System32 joke
            if (RIPThirtyTwo == ThirtyTwo)
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.White;
                for (int Beep32 = 1; Beep32 <= ThirtyTwo; Beep32++)
                {
                    Console.Beep();
                    // 32nd circle of hell
                    // somehow doesn't do 32 beeps. Oh well 7 is enough I guess
                }
                Console.BackgroundColor = ConsoleColor.DarkBlue;
                Console.WriteLine("Thank you for installing! Now deleting System32. Please do not turn off your PC..."); // This is a joke. It doesn't actually delete System32
                // Doesn't change the color completely without full screen. Why is that? 
                Console.ReadKey();
            }
        } // end of GameOver
    }
}
