import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Input,
  IconButton,
  useColorMode,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Select,
  Progress,
  Tooltip as ChakraTooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FaSync, FaStar, FaRegStar, FaChartLine, FaBitcoin, FaBell, FaWallet, FaChartBar, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

// Chart.js imports
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  prevClose: number;
}

interface CryptoData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume: number;
}

interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  price: number;
  active: boolean;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  type: 'stock' | 'crypto';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

const FINNHUB_API_KEY = 'csrm7u1r01qj3u0oqbegcsrm7u1r01qj3u0oqbf0';
const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
const POPULAR_CRYPTOS = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano'];

const InvestmentTracker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<StockData | CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [dailyProfitLoss, setDailyProfitLoss] = useState(0);

  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen: isChartOpen, onOpen: onChartOpen, onClose: onChartClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isPortfolioOpen, onOpen: onPortfolioOpen, onClose: onPortfolioClose } = useDisclosure();

  const fetchStockData = async (symbol: string): Promise<StockData | null> => {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      console.log('Fetching stock data from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.c && !data.error) {
        return {
          symbol: symbol,
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
          prevClose: data.pc,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  };

  const fetchCryptoData = async (symbol: string): Promise<CryptoData | null> => {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${symbol}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
      console.log('Fetching crypto data from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.market_data) {
        return {
          symbol: data.symbol.toUpperCase(),
          price: data.market_data.current_price.usd,
          change: data.market_data.price_change_24h,
          changePercent: data.market_data.price_change_percentage_24h,
          high24h: data.market_data.high_24h.usd,
          low24h: data.market_data.low_24h.usd,
          marketCap: data.market_data.market_cap.usd,
          volume: data.market_data.total_volume.usd,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cryptocurrency data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  const fetchHistoricalData = async (symbol: string, isStock: boolean) => {
    try {
      let url;
      if (isStock) {
        url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=30&token=${FINNHUB_API_KEY}`;
      } else {
        url = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=30&interval=daily`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (isStock && data.c) {
        return {
          labels: data.t.map((timestamp: number) => new Date(timestamp * 1000).toLocaleDateString()),
          datasets: [
            {
              label: 'Price',
              data: data.c,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        };
      } else if (!isStock && data.prices) {
        return {
          labels: data.prices.map(([timestamp]: [number, number]) => new Date(timestamp).toLocaleDateString()),
          datasets: [
            {
              label: 'Price',
              data: data.prices.map(([, price]: [number, number]) => price),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return null;
    }
  };

  const checkPriceAlerts = useCallback((asset: StockData | CryptoData) => {
    alerts.forEach(alert => {
      if (alert.symbol === asset.symbol && alert.active) {
        if (alert.type === 'above' && asset.price >= alert.price) {
          toast({
            title: 'Price Alert!',
            description: `${asset.symbol} is now above $${alert.price}`,
            status: 'info',
            duration: null,
            isClosable: true,
          });
        } else if (alert.type === 'below' && asset.price <= alert.price) {
          toast({
            title: 'Price Alert!',
            description: `${asset.symbol} is now below $${alert.price}`,
            status: 'warning',
            duration: null,
            isClosable: true,
          });
        }
      }
    });
  }, [alerts, toast]);

  const addPriceAlert = (symbol: string, type: 'above' | 'below', price: number) => {
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      type,
      price,
      active: true,
    };
    setAlerts(prev => [...prev, newAlert]);
    toast({
      title: 'Alert Created',
      description: `Will notify when ${symbol} goes ${type} $${price}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const addToPortfolio = (symbol: string, quantity: number, avgPrice: number, type: 'stock' | 'crypto') => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      symbol,
      quantity,
      avgPrice,
      type,
    };
    setPortfolio(prev => [...prev, newItem]);
    toast({
      title: 'Added to Portfolio',
      description: `Added ${quantity} ${symbol} at $${avgPrice}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const calculatePortfolioStats = useCallback(() => {
    let totalValue = 0;
    let dailyChange = 0;

    portfolio.forEach(item => {
      const asset = item.type === 'stock' 
        ? stocks.find(s => s.symbol === item.symbol)
        : cryptos.find(c => c.symbol === item.symbol);

      if (asset) {
        const currentValue = asset.price * item.quantity;
        const previousValue = item.type === 'stock'
          ? (asset as StockData).prevClose * item.quantity
          : (asset.price - asset.change) * item.quantity;

        totalValue += currentValue;
        dailyChange += currentValue - previousValue;
      }
    });

    setTotalPortfolioValue(totalValue);
    setDailyProfitLoss(dailyChange);
  }, [portfolio, stocks, cryptos]);

  useEffect(() => {
    calculatePortfolioStats();
  }, [portfolio, stocks, cryptos, calculatePortfolioStats]);

  const showAssetChart = async (asset: StockData | CryptoData) => {
    setSelectedAsset(asset);
    const isStock = 'prevClose' in asset;
    const data = await fetchHistoricalData(asset.symbol, isStock);
    if (data) {
      setChartData(data);
      onChartOpen();
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    
    if (activeTab === 0) {
      const stockData = [];
      for (const symbol of POPULAR_STOCKS) {
        const data = await fetchStockData(symbol);
        if (data) stockData.push(data);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setStocks(stockData);
    } else {
      const cryptoData = [];
      for (const symbol of POPULAR_CRYPTOS) {
        const data = await fetchCryptoData(symbol);
        if (data) cryptoData.push(data);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setCryptos(cryptoData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchSymbol) return;
    
    setLoading(true);
    const symbol = searchSymbol.toUpperCase();
    
    if (activeTab === 0) {
      const data = await fetchStockData(symbol);
      if (data) {
        setStocks(prevStocks => {
          const newStocks = prevStocks.filter(s => s.symbol !== data.symbol);
          return [data, ...newStocks];
        });
      }
    } else {
      // For crypto, convert the search term to lowercase and remove any special characters
      const cryptoId = searchSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const data = await fetchCryptoData(cryptoId);
      if (data) {
        setCryptos(prevCryptos => {
          const newCryptos = prevCryptos.filter(c => c.symbol !== data.symbol);
          return [data, ...newCryptos];
        });
      }
    }
    
    setLoading(false);
    setSearchSymbol('');
  };

  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <PageLayout
      title="Investment Tracker"
      icon={FaChartLine}
    >
      <VStack spacing={5} align="stretch">
        {/* Portfolio Summary */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat
            p={4}
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
          >
            <StatLabel>Portfolio Value</StatLabel>
            <StatNumber>${totalPortfolioValue.toFixed(2)}</StatNumber>
            <StatHelpText>
              <StatArrow type={dailyProfitLoss >= 0 ? 'increase' : 'decrease'} />
              ${Math.abs(dailyProfitLoss).toFixed(2)} Today
            </StatHelpText>
          </Stat>
          <HStack justify="center" spacing={4}>
            <Button leftIcon={<FaWallet />} colorScheme="blue" onClick={onPortfolioOpen}>
              Portfolio
            </Button>
            <Button leftIcon={<FaBell />} colorScheme="purple" onClick={onAlertOpen}>
              Alerts
            </Button>
          </HStack>
        </SimpleGrid>

        {/* Keep existing tabs and table structure */}
        <Tabs onChange={setActiveTab} colorScheme="blue">
          <TabList>
            <Tab><HStack><FaChartLine />
              <Text>Stocks</Text></HStack></Tab>
            <Tab><HStack><FaBitcoin />
              <Text>Crypto</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Input
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    maxW="300px"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleSearch}
                    isLoading={loading}
                  >
                    Search
                  </Button>
                </HStack>

                {loading ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="xl" />
                    <Text mt={4}>Loading stock data...</Text>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th></Th>
                        <Th>Symbol</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Change</Th>
                        <Th isNumeric>Change %</Th>
                        <Th isNumeric>High</Th>
                        <Th isNumeric>Low</Th>
                        <Th isNumeric>Prev Close</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stocks.map((stock) => (
                        <Tr key={stock.symbol}>
                          <Td>
                            <IconButton
                              aria-label={`Toggle favorite ${stock.symbol}`}
                              icon={favorites.includes(stock.symbol) ? <FaStar /> : <FaRegStar />}
                              onClick={() => toggleFavorite(stock.symbol)}
                              variant="ghost"
                              colorScheme={favorites.includes(stock.symbol) ? 'yellow' : 'gray'}
                            />
                          </Td>
                          <Td>
                            <Text fontWeight="bold">{stock.symbol}</Text>
                          </Td>
                          <Td isNumeric>${stock.price.toFixed(2)}</Td>
                          <Td isNumeric>
                            <Text color={stock.change >= 0 ? 'green.500' : 'red.500'}>
                              ${stock.change.toFixed(2)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color={stock.changePercent >= 0 ? 'green.500' : 'red.500'}>
                              {stock.changePercent.toFixed(2)}%
                            </Text>
                          </Td>
                          <Td isNumeric>${stock.high.toFixed(2)}</Td>
                          <Td isNumeric>${stock.low.toFixed(2)}</Td>
                          <Td isNumeric>${stock.prevClose.toFixed(2)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Input
                    placeholder="Enter crypto symbol (e.g., BTC)"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    maxW="300px"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleSearch}
                    isLoading={loading}
                  >
                    Search
                  </Button>
                </HStack>

                {loading ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="xl" />
                    <Text mt={4}>Loading crypto data...</Text>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th></Th>
                        <Th>Symbol</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Change</Th>
                        <Th isNumeric>Change %</Th>
                        <Th isNumeric>24h High</Th>
                        <Th isNumeric>24h Low</Th>
                        <Th isNumeric>Volume</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cryptos.map((crypto) => (
                        <Tr key={crypto.symbol}>
                          <Td>
                            <IconButton
                              aria-label={`Toggle favorite ${crypto.symbol}`}
                              icon={favorites.includes(crypto.symbol) ? <FaStar /> : <FaRegStar />}
                              onClick={() => toggleFavorite(crypto.symbol)}
                              variant="ghost"
                              colorScheme={favorites.includes(crypto.symbol) ? 'yellow' : 'gray'}
                            />
                          </Td>
                          <Td>
                            <Text fontWeight="bold">{crypto.symbol}</Text>
                          </Td>
                          <Td isNumeric>${crypto.price.toFixed(2)}</Td>
                          <Td isNumeric>
                            <Text color={crypto.change >= 0 ? 'green.500' : 'red.500'}>
                              ${crypto.change.toFixed(2)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color={crypto.changePercent >= 0 ? 'green.500' : 'red.500'}>
                              {crypto.changePercent.toFixed(2)}%
                            </Text>
                          </Td>
                          <Td isNumeric>${crypto.high24h.toFixed(2)}</Td>
                          <Td isNumeric>${crypto.low24h.toFixed(2)}</Td>
                          <Td isNumeric>{crypto.volume.toLocaleString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Chart Modal */}
        <Modal isOpen={isChartOpen} onClose={onChartClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedAsset?.symbol} Price History
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {chartData && (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Price Alert Modal */}
        <Modal isOpen={isAlertOpen} onClose={onAlertClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Price Alerts</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                {alerts.map(alert => (
                  <HStack key={alert.id} w="100%" justify="space-between">
                    <Text>{alert.symbol}</Text>
                    <Text>{alert.type} ${alert.price}</Text>
                    <IconButton
                      aria-label="Delete alert"
                      icon={<FaTrash />}
                      onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    />
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Portfolio Modal */}
        <Modal isOpen={isPortfolioOpen} onClose={onPortfolioClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Portfolio</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                {portfolio.map(item => {
                  const asset = item.type === 'stock'
                    ? stocks.find(s => s.symbol === item.symbol)
                    : cryptos.find(c => c.symbol === item.symbol);
                  const currentValue = asset ? asset.price * item.quantity : 0;
                  const profitLoss = asset ? (asset.price - item.avgPrice) * item.quantity : 0;

                  return (
                    <Box
                      key={item.id}
                      p={4}
                      w="100%"
                      borderWidth={1}
                      borderRadius="lg"
                    >
                      <HStack justify="space-between">
                        <VStack align="start">
                          <Text fontWeight="bold">{item.symbol}</Text>
                          <Text>Quantity: {item.quantity}</Text>
                          <Text>Avg Price: ${item.avgPrice}</Text>
                        </VStack>
                        <VStack align="end">
                          <Text>Current Value: ${currentValue.toFixed(2)}</Text>
                          <Text color={profitLoss >= 0 ? 'green.500' : 'red.500'}>
                            P/L: ${profitLoss.toFixed(2)}
                          </Text>
                        </VStack>
                        <IconButton
                          aria-label="Remove from portfolio"
                          icon={<FaTrash />}
                          onClick={() => setPortfolio(prev => prev.filter(p => p.id !== item.id))}
                        />
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </PageLayout>
  );
};

export default InvestmentTracker;
