import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Collapse,
  Badge,
  Tooltip,
  Divider,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, SunIcon, MoonIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { 
  FaHome, 
  FaCalculator, 
  FaExchangeAlt, 
  FaCoins, 
  FaChartLine, 
  FaMoneyBill, 
  FaCalendarAlt, 
  FaCode,
  FaHistory,
  FaStar,
  FaBars,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface Route {
  path: string;
  label: string;
  icon: any;
  subRoutes?: Route[];
  badge?: string;
  isNew?: boolean;
}

const routes: Route[] = [
  { 
    path: '/', 
    label: 'Ana Sayfa', 
    icon: FaHome,
  },
  {
    path: '/calculator',
    label: 'Hesap Makinesi',
    icon: FaCalculator,
    subRoutes: [
      { path: '/calculator', label: 'Standart', icon: FaCalculator },
      { path: '/calculator/financial', label: 'Finansal', icon: FaMoneyBill, isNew: true },
      { path: '/calculator/programmer', label: 'Programlayıcı', icon: FaCode },
    ],
  },
  { 
    path: '/date-calculator', 
    label: 'Tarih Hesaplayıcı', 
    icon: FaCalendarAlt,
  },
  { 
    path: '/exchange', 
    label: 'Döviz Çevirici', 
    icon: FaExchangeAlt,
    badge: 'Güncel',
  },
  { 
    path: '/coinflip', 
    label: 'Yazı Tura', 
    icon: FaCoins,
  },
  { 
    path: '/investments', 
    label: 'Yatırım Takip', 
    icon: FaChartLine,
    isNew: true,
  },
];

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ route }: { route: Route }) => {
    const isActive = isActiveRoute(route.path);
    const hasSubRoutes = route.subRoutes && route.subRoutes.length > 0;
    const isSubMenuOpen = activeSubMenu === route.path;

    const handleClick = () => {
      if (hasSubRoutes) {
        setActiveSubMenu(isSubMenuOpen ? null : route.path);
      } else {
        navigate(route.path);
        if (isMobile) onClose();
      }
    };

    return (
      <VStack align="stretch" width="100%">
        <Button
          width="100%"
          justifyContent="flex-start"
          variant="ghost"
          leftIcon={<route.icon />}
          rightIcon={hasSubRoutes ? <ChevronRightIcon transform={isSubMenuOpen ? 'rotate(90deg)' : ''} /> : undefined}
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : undefined}
          _hover={{ bg: hoverBg }}
          onClick={handleClick}
          position="relative"
        >
          <HStack width="100%" justify="space-between">
            <Text>{route.label}</Text>
            <HStack spacing={2}>
              {route.badge && (
                <Badge colorScheme="green" variant="subtle">
                  {route.badge}
                </Badge>
              )}
              {route.isNew && (
                <Badge colorScheme="blue" variant="solid">
                  Yeni
                </Badge>
              )}
            </HStack>
          </HStack>
        </Button>

        {hasSubRoutes && (
          <Collapse in={isSubMenuOpen}>
            <VStack align="stretch" pl={6} mt={1}>
              {route.subRoutes?.map((subRoute) => (
                <Button
                  key={subRoute.path}
                  width="100%"
                  justifyContent="flex-start"
                  variant="ghost"
                  size="sm"
                  leftIcon={<subRoute.icon />}
                  bg={isActiveRoute(subRoute.path) ? activeBg : 'transparent'}
                  color={isActiveRoute(subRoute.path) ? activeColor : undefined}
                  _hover={{ bg: hoverBg }}
                  onClick={() => {
                    navigate(subRoute.path);
                    if (isMobile) onClose();
                  }}
                >
                  <HStack width="100%" justify="space-between">
                    <Text>{subRoute.label}</Text>
                    {subRoute.isNew && (
                      <Badge colorScheme="blue" variant="solid">
                        Yeni
                      </Badge>
                    )}
                  </HStack>
                </Button>
              ))}
            </VStack>
          </Collapse>
        )}
      </VStack>
    );
  };

  const DesktopNav = () => (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <HStack spacing={8}>
        <Heading size="md" cursor="pointer" onClick={() => navigate('/')}>
          Calculator App
        </Heading>
        <HStack spacing={4}>
          {routes.map((route) => (
            <Box key={route.path}>
              {route.subRoutes ? (
                <Popover trigger="hover" placement="bottom-start">
                  <PopoverTrigger>
                    <Button
                      variant="ghost"
                      rightIcon={<ChevronDownIcon />}
                      bg={isActiveRoute(route.path) ? activeBg : undefined}
                      color={isActiveRoute(route.path) ? activeColor : undefined}
                    >
                      <HStack>
                        <route.icon />
                        <Text>{route.label}</Text>
                        {route.isNew && (
                          <Badge colorScheme="blue" variant="solid">
                            Yeni
                          </Badge>
                        )}
                      </HStack>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent p={2} width="200px">
                    <VStack align="stretch">
                      {route.subRoutes.map((subRoute) => (
                        <Button
                          key={subRoute.path}
                          variant="ghost"
                          leftIcon={<subRoute.icon />}
                          justifyContent="flex-start"
                          onClick={() => navigate(subRoute.path)}
                          bg={isActiveRoute(subRoute.path) ? activeBg : undefined}
                          color={isActiveRoute(subRoute.path) ? activeColor : undefined}
                        >
                          <HStack width="100%" justify="space-between">
                            <Text>{subRoute.label}</Text>
                            {subRoute.isNew && (
                              <Badge colorScheme="blue" variant="solid">
                                Yeni
                              </Badge>
                            )}
                          </HStack>
                        </Button>
                      ))}
                    </VStack>
                  </PopoverContent>
                </Popover>
              ) : (
                <Tooltip label={route.label} placement="bottom">
                  <Button
                    variant="ghost"
                    leftIcon={<route.icon />}
                    onClick={() => navigate(route.path)}
                    bg={isActiveRoute(route.path) ? activeBg : undefined}
                    color={isActiveRoute(route.path) ? activeColor : undefined}
                  >
                    <HStack>
                      <Text>{route.label}</Text>
                      {route.badge && (
                        <Badge colorScheme="green" variant="subtle">
                          {route.badge}
                        </Badge>
                      )}
                      {route.isNew && (
                        <Badge colorScheme="blue" variant="solid">
                          Yeni
                        </Badge>
                      )}
                    </HStack>
                  </Button>
                </Tooltip>
              )}
            </Box>
          ))}
        </HStack>
      </HStack>
      <HStack spacing={4}>
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
        />
      </HStack>
    </Flex>
  );

  const MobileNav = () => (
    <>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1rem"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Heading size="md" cursor="pointer" onClick={() => navigate('/')}>
          Calculator App
        </Heading>
        <HStack>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            variant="ghost"
          />
        </HStack>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menü</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              {routes.map((route) => (
                <NavItem key={route.path} route={route} />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        position="fixed"
        top={0}
        right={0}
        left={0}
        zIndex={1000}
      >
        {isMobile ? <MobileNav /> : <DesktopNav />}
        <HStack spacing={4} ml="auto">
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
          {user && (
            <Button
              leftIcon={<FaSignOutAlt />}
              onClick={handleLogout}
              variant="ghost"
              size="sm"
            >
              Çıkış Yap
            </Button>
          )}
        </HStack>
      </Flex>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </Box>
  );
}
