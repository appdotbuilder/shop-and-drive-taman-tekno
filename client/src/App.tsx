
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/utils/trpc';
import type { Promo, Product, Article, Comment, CreateCommentInput, CreateContactMessageInput, CreateServiceBookingInput } from '../../server/src/schema';

// Icons (using simple Unicode symbols for a clean look)
const icons = {
  home: '🏠',
  promo: '🎁',
  product: '🚗',
  article: '📰',
  contact: '📞',
  whatsapp: '💬',
  search: '🔍',
  like: '❤️',
  comment: '💬',
  calendar: '📅',
  location: '📍',
  phone: '📞',
  email: '📧',
  moon: '🌙',
  sun: '☀️',
  star: '⭐',
  clock: '🕒',
  user: '👤',
  menu: '☰'
};

function App() {
  // State management
  const [promos, setPromos] = useState<Promo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Form states
  const [commentForm, setCommentForm] = useState<CreateCommentInput>({
    article_id: 0,
    author_name: '',
    author_email: '',
    content: ''
  });

  const [contactForm, setContactForm] = useState<CreateContactMessageInput>({
    name: '',
    email: '',
    phone: null,
    subject: '',
    message: ''
  });

  const [serviceForm, setServiceForm] = useState<CreateServiceBookingInput>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_type: '',
    vehicle_type: null,
    preferred_date: new Date(),
    preferred_time: '',
    notes: null
  });

  // Load data
  const loadPromos = useCallback(async () => {
    try {
      const result = await trpc.getPromos.query();
      setPromos(result);
    } catch (error) {
      console.error('Failed to load promos:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const result = await trpc.getProducts.query();
      setProducts(result);
      setFilteredProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    try {
      const result = await trpc.getArticles.query();
      setArticles(result);
      setFilteredArticles(result);
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  }, []);

  const loadComments = useCallback(async (articleId: number) => {
    try {
      const result = await trpc.getCommentsByArticle.query({ articleId });
      setComments(result);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }, []);

  useEffect(() => {
    loadPromos();
    loadProducts();
    loadArticles();
  }, [loadPromos, loadProducts, loadArticles]);

  // Search and filter logic
  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter((product: Product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    let filtered = articles;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((article: Article) => article.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter((article: Article) => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedCategory]);

  // Handlers
  const handleLikeArticle = async (articleId: number) => {
    try {
      await trpc.likeArticle.mutate({ id: articleId });
      // Update the article in state
      setArticles((prev: Article[]) => prev.map((article: Article) => 
        article.id === articleId 
          ? { ...article, like_count: article.like_count + 1 }
          : article
      ));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => prev ? { ...prev, like_count: prev.like_count + 1 } : null);
      }
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    
    setIsLoading(true);
    try {
      await trpc.createComment.mutate({ ...commentForm, article_id: selectedArticle.id });
      setCommentForm({
        article_id: selectedArticle.id,
        author_name: '',
        author_email: '',
        content: ''
      });
      await loadComments(selectedArticle.id);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.createContactMessage.mutate(contactForm);
      setContactForm({
        name: '',
        email: '',
        phone: null,
        subject: '',
        message: ''
      });
      alert('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
    } catch (error) {
      console.error('Failed to submit contact:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.createServiceBooking.mutate(serviceForm);
      setServiceForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_type: '',
        vehicle_type: null,
        preferred_date: new Date(),
        preferred_time: '',
        notes: null
      });
      alert('Pemesanan layanan berhasil! Kami akan menghubungi Anda untuk konfirmasi.');
    } catch (error) {
      console.error('Failed to submit service booking:', error);
      alert('Gagal memesan layanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Halo Admin, Saya Butuh Bantuan 🙏');
    window.open(`https://wa.me/628995555095?text=${message}`, '_blank');
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent('Jl. Rawa Buntu Raya No. 61 A Ciater, Tangerang Selatan');
    window.open(`https://maps.google.com?q=${address}`, '_blank');
  };

  // Get unique categories
  const productCategories = Array.from(new Set(products.map((p: Product) => p.category)));
  const articleCategories = Array.from(new Set(articles.map((a: Article) => a.category)));
  const currentCategories = activeTab === 'products' ? productCategories : articleCategories;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Shop & Drive</h1>
              <span className="text-sm text-gray-500">Taman Tekno</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Cari produk atau artikel..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">{icons.search}</span>
              </div>
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span>{icons.sun}</span>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
                <span>{icons.moon}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={`sticky top-16 z-40 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="home" className="flex items-center space-x-2">
                <span>{icons.home}</span>
                <span>Beranda</span>
              </TabsTrigger>
              <TabsTrigger value="promos" className="flex items-center space-x-2">
                <span>{icons.promo}</span>
                <span>Promo</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <span>{icons.product}</span>
                <span>Produk</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center space-x-2">
                <span>{icons.article}</span>
                <span>Artikel</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center space-x-2">
                <span>{icons.contact}</span>
                <span>Kontak</span>
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-8 py-8">
              {/* Hero Section */}
              <section className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-blue-600">Selamat Datang di Shop & Drive</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Solusi lengkap kebutuhan otomotif Anda di Taman Tekno. Layanan profesional, produk berkualitas, dan pengalaman terbaik.
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setActiveTab('products')} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    {icons.product} Lihat Produk
                  </Button>
                  <Button onClick={openWhatsApp} variant="outline" size="lg">
                    {icons.whatsapp} Hubungi Kami
                  </Button>
                </div>
              </section>

              {/* Featured Promos */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-center">Promo Terbaru</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promos.slice(0, 3).map((promo: Promo) => (
                    <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-4xl">{icons.promo}</span>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-lg">{promo.title}</h4>
                        {promo.description && <p className="text-gray-600">{promo.description}</p>}
                        {promo.discount_percentage && (
                          <Badge className="mt-2 bg-red-500">Diskon {promo.discount_percentage}%</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center">
                  <Button onClick={() => setActiveTab('promos')} variant="outline">
                    Lihat Semua Promo
                  </Button>
                </div>
              </section>

              {/* Services Preview */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-center">Layanan Kami</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Service Berkala', desc: 'Perawatan rutin kendaraan', icon: '🔧' },
                    { title: 'Ganti Oli', desc: 'Penggantian oli mesin', icon: '🛢️' },
                    { title: 'Ban & Velg', desc: 'Pemasangan dan balancing', icon: '🛞' },
                    { title: 'Body Repair', desc: 'Perbaikan bodi kendaraan', icon: '🎨' }
                  ].map((service, index) => (
                    <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                      <div className="text-4xl mb-4">{service.icon}</div>
                      <h4 className="font-bold">{service.title}</h4>
                      <p className="text-gray-600 text-sm">{service.desc}</p>
                    </Card>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Promos Tab */}
            <TabsContent value="promos" className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Promo Menarik</h2>
                <p className="text-gray-600">Jangan lewatkan penawaran terbaik dari kami!</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.map((promo: Promo) => (
                  <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-6xl">{icons.promo}</span>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">{promo.title}</h3>
                        {promo.description && (
                          <p className="text-gray-600">{promo.description}</p>
                        )}
                        {promo.discount_percentage && (
                          <Badge className="bg-red-500 text-white">
                            Diskon {promo.discount_percentage}%
                          </Badge>
                        )}
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{icons.calendar} {promo.start_date.toLocaleDateString()}</span>
                          <span>s/d {promo.end_date.toLocaleDateString()}</span>
                        </div>
                        <Button 
                          onClick={openWhatsApp}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {icons.whatsapp} Hubungi untuk Promo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Produk Kami</h2>
                <p className="text-gray-600">Produk otomotif berkualitas untuk kebutuhan Anda</p>
              </div>

              {/* Category Filter */}
              {currentCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                  >
                    Semua
                  </Button>
                  {currentCategories.map((category: string) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      size="sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product: Product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl">{icons.product}</span>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </div>
                        {product.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-blue-600">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stok: {product.stock_quantity}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedProduct(product)}
                              >
                                Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              {selectedProduct && (
                                <>
                                  <DialogHeader>
                                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                                    <DialogDescription>
                                      Informasi detail produk
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                      <span className="text-8xl">{icons.product}</span>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                                        <Badge className="mt-1">{selectedProduct.category}</Badge>
                                      </div>
                                      {selectedProduct.description && (
                                        <p className="text-gray-600">{selectedProduct.description}</p>
                                      )}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="text-sm text-gray-500">Harga:</span>
                                          <p className="text-2xl font-bold text-blue-600">
                                            Rp {selectedProduct.price.toLocaleString('id-ID')}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-500">Stok:</span>
                                          <p className="text-lg font-semibold">{selectedProduct.stock_quantity}</p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-4">
                                        <Button 
                                          onClick={openWhatsApp}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                          {icons.whatsapp} Pesan via WhatsApp
                                        </Button>
                                        <Button 
                                          onClick={() => setActiveTab('contact')}
                                          variant="outline"
                                          className="flex-1"
                                        >
                                          {icons.contact} Kontak Kami
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            onClick={openWhatsApp}
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {icons.whatsapp} Pesan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Artikel & Tips</h2>
                <p className="text-gray-600">Informasi dan tips seputar dunia otomotif</p>
              </div>

              {/* Category Filter */}
              {currentCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                  >
                    Semua
                  </Button>
                  {currentCategories.map((category: string) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      size="sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article: Article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl">{icons.article}</span>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg line-clamp-2">{article.title}</h3>
                          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        </div>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{icons.user} {article.author}</span>
                          <span>{icons.clock} {article.created_at.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{icons.like} {article.like_count}</span>
                            <span>👁️ {article.view_count}</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  setSelectedArticle(article);
                                  await loadComments(article.id);
                                }}
                              >
                                Baca Selengkapnya
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              {selectedArticle && (
                                <>
                                  <DialogHeader>
                                    <DialogTitle className="text-left">{selectedArticle.title}</DialogTitle>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>{icons.user} {selectedArticle.author}</span>
                                      <span>{icons.clock} {selectedArticle.created_at.toLocaleDateString()}</span>
                                      <Badge variant="secondary">{selectedArticle.category}</Badge>
                                    </div>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[60vh]">
                                    <div className="space-y-6">
                                      <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-8xl">{icons.article}</span>
                                      </div>
                                      <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
                                      </div>
                                      
                                      {/* Article Actions */}
                                      <div className="flex items-center space-x-4 py-4 border-y">
                                        <Button
                                          variant="outline"
                                          onClick={() => handleLikeArticle(selectedArticle.id)}
                                          className="flex items-center space-x-2"
                                        >
                                          <span>{icons.like}</span>
                                          <span>Suka ({selectedArticle.like_count})</span>
                                        </Button>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                          <span>👁️ {selectedArticle.view_count} views</span>
                                        </div>
                                      </div>

                                      {/* Comments Section */}
                                      <div className="space-y-6">
                                        <h4 className="text-lg font-bold flex items-center space-x-2">
                                          <span>{icons.comment}</span>
                                          <span>Komentar ({comments.length})</span>
                                        </h4>
                                        
                                        {/* Add Comment Form */}
                                        <form onSubmit={handleSubmitComment} className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="author_name">Nama</Label>
                                              <Input
                                                id="author_name"
                                                value={commentForm.author_name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                  setCommentForm((prev: CreateCommentInput) => ({ ...prev, author_name: e.target.value }))
                                                }
                                                required
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="author_email">Email</Label>
                                              <Input
                                                id="author_email"
                                                type="email"
                                                value={commentForm.author_email}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                  setCommentForm((prev: CreateCommentInput) => ({ ...prev, author_email: e.target.value }))
                                                }
                                                required
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="content">Komentar</Label>
                                            <Textarea
                                              id="content"
                                              value={commentForm.content}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setCommentForm((prev: CreateCommentInput) => ({ ...prev, content: e.target.value }))
                                              }
                                              placeholder="Tulis komentar Anda..."
                                              rows={3}
                                              required
                                            />
                                          </div>
                                          <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Mengirim...' : 'Kirim Komentar'}
                                          </Button>
                                        </form>

                                        {/* Comments List */}
                                        <div className="space-y-4">
                                          {comments.map((comment: Comment) => (
                                            <div key={comment.id} className="border rounded-lg p-4">
                                              <div className="flex items-start space-x-3">
                                                <Avatar>
                                                  <AvatarFallback>
                                                    {comment.author_name.charAt(0).toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="font-semibold">{comment.author_name}</span>
                                                    <span className="text-sm text-gray-500">
                                                      {comment.created_at.toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                  <p className="mt-1">{comment.content}</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-8 py-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Hubungi Kami</h2>
                <p className="text-gray-600">Kami siap membantu kebutuhan otomotif Anda</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{icons.location}</span>
                        <span>Informasi Kontak</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{icons.location}</span>
                        <div>
                          <h4 className="font-semibold">Alamat</h4>
                          <p className="text-gray-600">Jl. Rawa Buntu Raya No. 61 A<br />Ciater, Tangerang Selatan</p>
                          <Button 
                            variant="link" 
                            onClick={openGoogleMaps}
                            className="p-0 h-auto text-blue-600"
                          >
                            Lihat di Google Maps
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{icons.phone}</span>
                        <div>
                          <h4 className="font-semibold">Telepon</h4>
                          <p className="text-gray-600">08995555095</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{icons.whatsapp}</span>
                        <div>
                          <h4 className="font-semibold">WhatsApp</h4>
                          <p className="text-gray-600">628995555095</p>
                          <Button 
                            variant="link" 
                            onClick={openWhatsApp}
                            className="p-0 h-auto text-green-600"
                          >
                            Kirim Pesan
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{icons.clock}</span>
                        <div>
                          <h4 className="font-semibold">Jam Operasional</h4>
                          <p className="text-gray-600">
                            Senin - Jumat: 08:00 - 17:00<br />
                            Sabtu: 08:00 - 15:00<br />
                            Minggu: Tutup
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Booking */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{icons.calendar}</span>
                        <span>Booking Layanan</span>
                      </CardTitle>
                      <CardDescription>
                        Pesan layanan otomotif dengan mudah
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitService} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customer_name">Nama</Label>
                            <Input
                              id="customer_name"
                              value={serviceForm.customer_name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ ...prev, customer_name: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer_phone">No. Telepon</Label>
                            <Input
                              id="customer_phone"
                              value={serviceForm.customer_phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ ...prev, customer_phone: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="customer_email">Email</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={serviceForm.customer_email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setServiceForm((prev: CreateServiceBookingInput) => ({ ...prev, customer_email: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="service_type">Jenis Layanan</Label>
                            <Input
                              id="service_type"
                              value={serviceForm.service_type}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ ...prev, service_type: e.target.value }))
                              }
                              placeholder="Contoh: Service rutin"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="vehicle_type">Jenis Kendaraan</Label>
                            <Input
                              id="vehicle_type"
                              value={serviceForm.vehicle_type || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ 
                                  ...prev, 
                                  vehicle_type: e.target.value || null 
                                }))
                              }
                              placeholder="Contoh: Honda Jazz"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preferred_date">Tanggal Pilihan</Label>
                            <Input
                              id="preferred_date"
                              type="date"
                              value={serviceForm.preferred_date.toISOString().split('T')[0]}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ 
                                  ...prev, 
                                  preferred_date: new Date(e.target.value) 
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="preferred_time">Waktu Pilihan</Label>
                            <Input
                              id="preferred_time"
                              type="time"
                              value={serviceForm.preferred_time}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setServiceForm((prev: CreateServiceBookingInput) => ({ ...prev, preferred_time: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="booking_notes">Catatan (Opsional)</Label>
                          <Textarea
                            id="booking_notes"
                            value={serviceForm.notes || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setServiceForm((prev: CreateServiceBookingInput) => ({ 
                                ...prev, 
                                notes: e.target.value || null 
                              }))
                            }
                            placeholder="Keluhan atau permintaan khusus..."
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? 'Mengirim...' : 'Pesan Layanan'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <div>
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{icons.email}</span>
                        <span>Kirim Pesan</span>
                      </CardTitle>
                      <CardDescription>
                        Sampaikan pertanyaan atau saran Anda
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitContact} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nama</Label>
                            <Input
                              id="name"
                              value={contactForm.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setContactForm((prev: CreateContactMessageInput) => ({ ...prev, name: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">No. Telepon</Label>
                            <Input
                              id="phone"
                              value={contactForm.phone || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setContactForm((prev: CreateContactMessageInput) => ({ 
                                  ...prev, 
                                  phone: e.target.value || null 
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setContactForm((prev: CreateContactMessageInput) => ({ ...prev, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subjek</Label>
                          <Input
                            id="subject"
                            value={contactForm.subject}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setContactForm((prev: CreateContactMessageInput) => ({ ...prev, subject: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Pesan</Label>
                          <Textarea
                            id="message"
                            value={contactForm.message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setContactForm((prev: CreateContactMessageInput) => ({ ...prev, message: e.target.value }))
                            }
                            placeholder="Tulis pesan Anda di sini..."
                            rows={5}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? 'Mengirim...' : 'Kirim Pesan'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <Button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg z-50 animate-pulse"
        size="icon"
      >
        <span className="text-2xl">{icons.whatsapp}</span>
      </Button>

      {/* Footer */}
      <footer className={`border-t mt-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">Shop & Drive</h3>
              <p className="text-gray-600">
                Solusi lengkap kebutuhan otomotif Anda di Taman Tekno, Tangerang Selatan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-600">
                <p>{icons.location} Jl. Rawa Buntu Raya No. 61 A</p>
                <p>{icons.phone} 08995555095</p>
                <p>{icons.whatsapp} 628995555095</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Jam Operasional</h4>
              <div className="space-y-2 text-gray-600">
                <p>Senin - Jumat: 08:00 - 17:00</p>
                <p>Sabtu: 08:00 - 15:00</p>
                <p>Minggu: Tutup</p>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Shop & Drive Taman Tekno. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
