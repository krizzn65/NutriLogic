// Contact Page Component
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    User,
    MessageSquare,
    Building,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

const contactMethods = [
    {
        icon: Mail,
        title: "Email Kami",
        description: "Hubungi via email",
        value: "nutrilogic@posyandu.id",
        link: "mailto:nutrilogic@posyandu.id",
        gradient: "from-[#00BFEF]/20 to-[#0088c2]/20"
    },
    {
        icon: Phone,
        title: "Telepon Kami",
        description: "Bicara langsung dengan tim",
        value: "+62 896-5690-5302",
        link: "tel:+6289656905302",
        gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
        icon: MapPin,
        title: "Kunjungi Kami",
        description: "Kantor pusat",
        value: "Jember, Indonesia",
        link: "#",
        gradient: "from-blue-500/20 to-indigo-500/20"
    }
];

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const containerRef = useRef(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Masukkan email yang valid';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Pesan wajib diisi';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Pesan minimal 10 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.23, 0.86, 0.39, 0.96]
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    return (
        <section
            id="Contact"
            className="relative py-24 lg:py-32 bg-white text-gray-800 overflow-hidden font-montserrat px-6 md:px-[150px] lg:px-[230px]">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0">
                {/* Animated gradient mesh */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#00BFEF]/[0.05] via-[#0088c2]/[0.03] to-[#006b9e]/[0.05]"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        backgroundSize: '400% 400%'
                    }} />

                {/* Moving orbs */}
                <motion.div
                    className="absolute top-1/3 left-1/5 w-96 h-96 bg-[#00BFEF]/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 200, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }} />
                <motion.div
                    className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-[#0088c2]/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, -150, 0],
                        y: [0, -80, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }} />
            </div>

            <motion.div
                ref={containerRef}
                className="relative z-10 w-full"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}>
                {/* Header */}
                <motion.div className="text-center mb-20" variants={fadeInUp}>
                    <motion.h2
                        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tight"
                        variants={fadeInUp}>
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                            Hubungi
                        </span>
                        <br />
                        <motion.span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-[#00BFEF] via-[#0088c2] to-[#006b9e]"
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                backgroundSize: '200% 200%'
                            }}>
                            Kami
                        </motion.span>
                    </motion.h2>

                    <motion.p
                        className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
                        variants={fadeInUp}>
                        Siap meningkatkan kualitas gizi balita di posyandu Anda? Mari diskusikan bagaimana NutriLogic dapat membantu.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div className="space-y-8" variants={fadeInUp}>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Kirim Pesan</h3>
                            <p className="text-gray-600 text-lg">
                                Ceritakan tentang kebutuhan Anda dan kami akan merespons dalam 24 jam.
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <User
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Nama Anda"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-4 bg-white border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00BFEF] focus:ring-2 focus:ring-[#00BFEF]/20 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200'
                                                    }`} />
                                            {errors.name && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-500 text-sm mt-2">
                                                    {errors.name}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Mail
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="Alamat Email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-4 bg-white border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00BFEF] focus:ring-2 focus:ring-[#00BFEF]/20 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'
                                                    }`} />
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-500 text-sm mt-2">
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Building
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Posyandu/Instansi (Opsional)"
                                            value={formData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00BFEF] focus:ring-2 focus:ring-[#00BFEF]/20 transition-all" />
                                    </div>

                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                                        <textarea
                                            placeholder="Ceritakan kebutuhan Anda..."
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-4 bg-white border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00BFEF] focus:ring-2 focus:ring-[#00BFEF]/20 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-gray-200'
                                                }`} />
                                        {errors.message && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm mt-2">
                                                {errors.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full relative group overflow-hidden bg-gradient-to-r from-[#00BFEF] to-[#0088c2] hover:from-[#00a8d6] hover:to-[#006b9e] text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#00BFEF]/30"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                            initial={{ x: "-100%" }}
                                            whileHover={{ x: "100%" }}
                                            transition={{ duration: 0.5 }} />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {isSubmitting ? (
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Kirim Pesan
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-12">
                                    <motion.div
                                        className="w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-6"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Pesan Terkirim!</h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        Terima kasih telah menghubungi kami. Kami akan merespons dalam 24 jam.
                                    </p>
                                    <motion.button
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            setFormData({ name: '', email: '', company: '', message: '' });
                                        }}
                                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}>
                                        Kirim Pesan Lain
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Contact Methods */}
                    <motion.div className="space-y-8" variants={fadeInUp}>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Cara Lain Menghubungi</h3>
                            <p className="text-gray-600 text-lg">
                                Pilih metode yang paling nyaman untuk Anda.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={index}
                                    href={method.link}
                                    className="block p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 hover:bg-white hover:shadow-md transition-all group"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}>
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} border border-[#00BFEF]/30 flex items-center justify-center`}
                                            whileHover={{ scale: 1.1, rotateY: 180 }}
                                            transition={{ duration: 0.6 }}>
                                            <method.icon className="w-7 h-7 text-[#00BFEF]" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-semibold text-gray-800 mb-1">{method.title}</h4>
                                            <p className="text-gray-500 text-sm mb-2">{method.description}</p>
                                            <p className="text-gray-800 font-medium">{method.value}</p>
                                        </div>
                                        <ArrowRight
                                            className="w-5 h-5 text-gray-400 group-hover:text-[#00BFEF] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <motion.div
                            className="p-6 bg-gradient-to-br from-[#00BFEF]/[0.08] to-[#0088c2]/[0.08] backdrop-blur-xl rounded-2xl border border-[#00BFEF]/30"
                            variants={fadeInUp}>
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Garansi Respon Cepat</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Kami berkomitmen untuk merespons dengan cepat. Semua pertanyaan biasanya dijawab dalam 24 jam,
                                dan kami akan menjadwalkan panggilan untuk mendiskusikan kebutuhan Anda secara detail.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}

export default Contact;
