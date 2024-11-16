import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Icon,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import {
  FaCalculator,
  FaHistory,
  FaChartLine,
  FaCode,
  FaCalendarAlt,
  FaExchangeAlt,
  FaCoins,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';

interface FeatureProps {
  title: string;
  description: string;
  icon: IconType;
  path: string;
  textColor: string;
}

const features: Omit<FeatureProps, 'textColor'>[] = [
  {
    title: 'Hesap Makinesi',
    description: 'Temel matematik işlemlerinizi yapın',
    icon: FaCalculator,
    path: '/calculator'
  },
  {
    title: 'Programlayıcı Hesap Makinesi',
    description: 'Programlama için özel hesaplamalar yapın',
    icon: FaCode,
    path: '/calculator/programmer'
  },
  {
    title: 'Tarih Hesaplayıcı',
    description: 'İki tarih arasındaki farkı hesaplayın veya tarihlere gün ekleyip çıkarın',
    icon: FaCalendarAlt,
    path: '/date-calculator'
  },
  {
    title: 'Döviz Çevirici',
    description: 'Gerçek zamanlı döviz kurları ile para birimi dönüşümleri',
    icon: FaExchangeAlt,
    path: '/exchange'
  },
  {
    title: 'Yazı Tura',
    description: 'Klasik yazı tura oyunu, istatistikler ve sonuç takibi',
    icon: FaCoins,
    path: '/coinflip'
  },
  {
    title: 'Yatırım Takip',
    description: 'Yatırımlarınızı takip edin ve analiz edin',
    icon: FaChartLine,
    path: '/investments'
  }
];

const Feature: React.FC<FeatureProps> = ({ title, description, icon, path, textColor }) => {
  const navigate = useNavigate();
  const { addActivity } = useActivity();

  const handleClick = () => {
    navigate(path);
    addActivity(
      path.split('/')[1] as any,
      `${title} sayfası ziyaret edildi`
    );
  };

  return (
    <Card
      onClick={handleClick}
      cursor="pointer"
      _hover={{ transform: 'translateY(-5px)', transition: 'all 0.2s' }}
    >
      <CardBody>
        <HStack spacing={4}>
          <Icon as={icon} w={8} h={8} color="blue.500" />
          <Box>
            <Heading size="md" mb={2}>
              {title}
            </Heading>
            <Text color={textColor}>
              {description}
            </Text>
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { stats, getRecentActivities } = useActivity();
  const { colorMode } = useColorMode();

  // Hook'ları en üstte çağır
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');
  const bgGradient = useColorModeValue(
    'linear(to-b, blue.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );

  const recentActivities = getRecentActivities(3);

  if (!user) {
    return null;
  }

  const featuresWithColors = features.map(feature => ({
    ...feature,
    textColor: descriptionColor,
  }));

  return (
    <Box minH="calc(100vh - 80px)" p={8} bgGradient={bgGradient}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color={textColor}>
              Hoş Geldin, {user.username}!
            </Heading>
            <Text color={descriptionColor}>
              İşte hesap makinesi aktivitelerinizin özeti
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaCalculator} w={6} h={6} color="blue.500" />
                  <Heading size="md" color={textColor}>
                    Hesaplamalar
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stat>
                  <StatLabel>Bugün</StatLabel>
                  <StatNumber>{stats.today}</StatNumber>
                  <StatHelpText>Son 24 saat</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaChartLine} w={6} h={6} color="green.500" />
                  <Heading size="md" color={textColor}>
                    Haftalık İşlemler
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stat>
                  <StatLabel>Bu Hafta</StatLabel>
                  <StatNumber>{stats.thisWeek}</StatNumber>
                  <StatHelpText>Son 7 gün</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaHistory} w={6} h={6} color="purple.500" />
                  <Heading size="md" color={textColor}>
                    Aylık İşlemler
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stat>
                  <StatLabel>Bu Ay</StatLabel>
                  <StatNumber>{stats.thisMonth}</StatNumber>
                  <StatHelpText>Son 30 gün</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Son İşlemler
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {recentActivities.map((activity) => (
                <Card
                  key={activity.id}
                  bg={bgColor}
                  borderColor={borderColor}
                  borderWidth="1px"
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Icon as={activity.icon} w={6} h={6} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold" color={textColor}>
                          {activity.type}
                        </Text>
                        <Text color={descriptionColor}>
                          {activity.description}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {activity.date}
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Özellikler
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {featuresWithColors.map((feature) => (
                <Feature key={feature.title} {...feature} />
              ))}
            </SimpleGrid>
          </Box>

          <Box textAlign="center" mt={8}>
            <Text color="gray.500" fontSize="sm">
              2024 Hesaplama Aracı. Tüm hakları saklıdır.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
