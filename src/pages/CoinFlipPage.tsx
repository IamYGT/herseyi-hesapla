import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  useColorModeValue,
  Image,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
  Tooltip,
  Container,
  Card,
  CardBody,
  Badge,
  HStack,
  Progress,
  Kbd,
  SimpleGrid,
  Heading,
  useBreakpointValue
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { FaDice, FaHistory } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

interface CoinStats {
  heads: number;
  tails: number;
  total: number;
}

interface FlipHistory {
  result: 'heads' | 'tails';
  timestamp: number;
}

const CoinFlipPage: React.FC = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [stats, setStats] = useState<CoinStats>({ heads: 0, tails: 0, total: 0 });
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<FlipHistory[]>([]);
  const [streak, setStreak] = useState({ count: 0, type: null as 'heads' | 'tails' | null });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBgColor = useColorModeValue('blue.50', 'blue.900');
  const coinSize = useBreakpointValue({ base: "150px", md: "200px" });
  const toast = useToast();

  const flipCoin = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setRotation(prev => prev + 1080); // 3 tam tur
    
    // Rastgele sonuç
    const random = Math.random();
    const newResult = random < 0.5 ? 'heads' : 'tails';

    // Animasyon süresi
    setTimeout(() => {
      setResult(newResult);
      
      // İstatistikleri güncelle
      setStats(prev => ({
        heads: prev.heads + (newResult === 'heads' ? 1 : 0),
        tails: prev.tails + (newResult === 'tails' ? 1 : 0),
        total: prev.total + 1
      }));

      // Geçmişi güncelle
      setHistory(prev => {
        const newFlip: FlipHistory = { result: newResult, timestamp: Date.now() };
        return [newFlip, ...prev].slice(0, 10);
      });

      // Seriyi güncelle
      setStreak(prev => {
        if (prev.type === newResult) {
          return { count: prev.count + 1, type: newResult };
        }
        return { count: 1, type: newResult };
      });

      setIsFlipping(false);

      toast({
        title: 'Sonuç',
        description: newResult === 'heads' ? 'YAZI' : 'TURA',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top'
      });
    }, 1500);
  }, [isFlipping, toast]);

  const resetStats = useCallback(() => {
    setStats({ heads: 0, tails: 0, total: 0 });
    setResult(null);
    setHistory([]);
    setStreak({ count: 0, type: null });
    toast({
      title: 'İstatistikler Sıfırlandı',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top'
    });
  }, [toast]);

  // Klavye desteği
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isFlipping) {
        flipCoin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flipCoin, isFlipping]);

  return (
    <PageLayout
      title="Yazı Tura"
      icon={FaDice}
      description="Yazı tura at ve istatistikleri takip et"
    >
      <Container maxW="container.lg" py={4}>
        <Card bg={bgColor} shadow="xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={8}>
              <Box
                position="relative"
                w={coinSize}
                h={coinSize}
                style={{
                  transform: `rotateY(${rotation}deg)`,
                  transition: 'transform 1.5s ease-in-out',
                  transformStyle: 'preserve-3d'
                }}
              >
                <Image
                  src={result === 'tails' ? '/coin-tails.svg' : '/coin-heads.svg'}
                  alt="Coin"
                  w="100%"
                  h="100%"
                  objectFit="contain"
                  filter={isFlipping ? 'blur(1px)' : 'none'}
                  style={{ backfaceVisibility: 'hidden' }}
                />
              </Box>

              <VStack spacing={2}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={flipCoin}
                  isLoading={isFlipping}
                  loadingText="Atılıyor..."
                  w="200px"
                  leftIcon={<FaDice />}
                >
                  Para At
                </Button>
                <Text fontSize="sm" color="gray.500">
                  veya <Kbd>Space</Kbd> tuşuna bas
                </Text>
              </VStack>

              <Card w="100%" bg={statBgColor} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4}>
                    <StatGroup w="100%" textAlign="center">
                      <Stat>
                        <StatLabel>Yazı</StatLabel>
                        <StatNumber>{stats.heads}</StatNumber>
                        <Text fontSize="sm" color="gray.500">
                          {stats.total > 0 ? ((stats.heads / stats.total) * 100).toFixed(1) : 0}%
                        </Text>
                      </Stat>

                      <Stat>
                        <StatLabel>Tura</StatLabel>
                        <StatNumber>{stats.tails}</StatNumber>
                        <Text fontSize="sm" color="gray.500">
                          {stats.total > 0 ? ((stats.tails / stats.total) * 100).toFixed(1) : 0}%
                        </Text>
                      </Stat>

                      <Stat>
                        <StatLabel>Toplam</StatLabel>
                        <StatNumber>{stats.total}</StatNumber>
                        <Tooltip label="İstatistikleri Sıfırla">
                          <IconButton
                            aria-label="Reset stats"
                            icon={<RepeatIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={resetStats}
                          />
                        </Tooltip>
                      </Stat>
                    </StatGroup>

                    {stats.total > 0 && (
                      <Box w="100%">
                        <Progress
                          value={(stats.heads / stats.total) * 100}
                          colorScheme="blue"
                          borderRadius="full"
                          height="20px"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs">Yazı: {((stats.heads / stats.total) * 100).toFixed(1)}%</Text>
                          <Text fontSize="xs">Tura: {((stats.tails / stats.total) * 100).toFixed(1)}%</Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {streak.count > 1 && (
                <Badge
                  colorScheme={streak.type === 'heads' ? 'blue' : 'green'}
                  p={2}
                  borderRadius="full"
                  fontSize="md"
                >
                  {streak.count} {streak.type === 'heads' ? 'Yazı' : 'Tura'} Serisi!
                </Badge>
              )}

              {history.length > 0 && (
                <Box w="100%">
                  <Heading size="md" mb={4}>
                    <HStack>
                      <FaHistory />
                      <Text>Son Atışlar</Text>
                    </HStack>
                  </Heading>
                  <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                    {history.map((flip) => (
                      <Badge
                        key={flip.timestamp}
                        colorScheme={flip.result === 'heads' ? 'blue' : 'green'}
                        p={2}
                        textAlign="center"
                      >
                        {flip.result === 'heads' ? 'YAZI' : 'TURA'}
                      </Badge>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default CoinFlipPage;
