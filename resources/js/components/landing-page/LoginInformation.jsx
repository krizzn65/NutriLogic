import React, { useState } from 'react';
import { Copy, Check, Shield, User, Users, Info } from 'lucide-react';

const LoginInformation = () => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const credentials = [
        {
            role: 'Admin',
            email: 'admin@nutrilogic.com',
            pass: 'Admin123',
            icon: <Shield className="w-4 h-4" />,
            color: 'text-red-500',
            bg: 'bg-red-50'
        },
        {
            role: 'Kader 1',
            email: 'kader@nutrilogic.com',
            pass: 'Kader123',
            icon: <User className="w-4 h-4" />,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            role: 'Kader 2',
            email: 'kader2@nutrilogic.com',
            pass: 'Kader123',
            icon: <User className="w-4 h-4" />,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            role: 'Parent',
            email: 'ratna@gmail.com',
            pass: 'Parent123',
            icon: <Users className="w-4 h-4" />,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
    ];

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 animate-fade-in-scale h-full w-full" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Info size={20} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 font-montserrat text-lg leading-tight">
                        Akses Demo Juri
                    </h3>
                    <p className="text-gray-500 text-xs font-medium">
                        Klik kredensial untuk menyalin
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
                {credentials.map((cred, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-50/80 hover:bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-all group duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${cred.bg} ${cred.color}`}>
                                    {cred.icon}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${cred.color}`}>
                                    {cred.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5 pl-9">
                            <button
                                className="w-full flex items-center justify-between gap-2 text-left group/btn"
                                onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                                title="Copy Email"
                            >
                                <span className="text-xs text-gray-600 font-medium hover:text-gray-900 truncate transition-colors">{cred.email}</span>
                                {copiedIndex === `email-${idx}` ? (
                                    <Check size={12} className="text-green-500 flex-shrink-0" />
                                ) : (
                                    <Copy size={12} className="text-gray-300 group-hover/btn:text-gray-500 transition-colors opacity-0 group-hover/btn:opacity-100 flex-shrink-0" />
                                )}
                            </button>

                            <button
                                className="w-full flex items-center justify-between gap-2 text-left group/btn"
                                onClick={() => copyToClipboard(cred.pass, `pass-${idx}`)}
                                title="Copy Password"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400">Pass:</span>
                                    <span className="text-xs text-gray-600 font-mono hover:text-gray-900 transition-colors">{cred.pass}</span>
                                </div>
                                {copiedIndex === `pass-${idx}` ? (
                                    <Check size={12} className="text-green-500 flex-shrink-0" />
                                ) : (
                                    <Copy size={12} className="text-gray-300 group-hover/btn:text-gray-500 transition-colors opacity-0 group-hover/btn:opacity-100 flex-shrink-0" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoginInformation;
