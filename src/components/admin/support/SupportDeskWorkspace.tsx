import { useState } from 'react';
import { SupportSidebar, type SupportSessionItem } from './SupportSidebar';
import { ChatFeed, type ChatMessageItem } from './ChatFeed';
import { UserContextBoard, type CustomerProfileData, type RecentOrderItem } from './UserContextBoard';
import { toast } from 'sonner';
import { PowerOff } from 'lucide-react';

interface MockSessionDetail {
  id: string;
  customerPhone: string;
  customerName: string;
  customerInitials: string;
  status: 'OPEN' | 'CLOSED';
  unread: boolean;
  orderNumber?: string;
  profile: CustomerProfileData;
  recentOrders: RecentOrderItem[];
  messages: ChatMessageItem[];
}

const INITIAL_MOCK_SESSIONS: MockSessionDetail[] = [
  {
    id: 'sess-1',
    customerName: 'Washim Mallick',
    customerPhone: '+91 74791 35626',
    customerInitials: 'WM',
    status: 'OPEN',
    unread: true,
    orderNumber: '#TW-20261017-1042',
    profile: {
      name: 'Washim Mallick',
      phone: '+91 74791 35626',
      accountAge: '2.4 yrs (Joined May 2024)',
      verified: true,
      lifetimeValue: '₹4,250',
      ordersCount: 4,
      shippingCity: 'Kolkata, West Bengal (700009)',
    },
    recentOrders: [
      {
        id: 'ord-1042',
        orderNumber: '#TW-20261017-1042',
        title: 'Higher Engineering Mathematics - B.S. Grewal (44th Ed.)',
        status: 'In Transit',
        amount: '₹1,250',
        date: 'Today, 10:42 AM',
      },
      {
        id: 'ord-0914',
        orderNumber: '#TW-20260812-0914',
        title: 'Introduction to Algorithms (CLRS) - 4th Edition',
        status: 'Delivered',
        amount: '₹1,850',
        date: '12 Aug 2026',
      },
      {
        id: 'ord-0501',
        orderNumber: '#TW-20260501-0211',
        title: 'Data Structures and Algorithms in C++ - Adam Drozdek',
        status: 'Delivered',
        amount: '₹1,150',
        date: '01 May 2026',
      },
    ],
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        content: 'Hi Techno World! I ordered my engineering maths book today morning with express delivery.',
        timestamp: '11:15 AM',
      },
      {
        id: 'm2',
        senderType: 'CUSTOMER',
        content: 'Could you please check if order #TW-20261017-1042 has shipped? Need it urgently for upcoming semester exams.',
        timestamp: '11:16 AM',
      },
      {
        id: 'm3',
        senderType: 'ADMIN',
        content: 'Hello Washim da! Thank you for reaching out to Techno World Books support. Let me check your shipment details directly with our College Street dispatch warehouse.',
        timestamp: '11:18 AM',
        status: 'read',
      },
      {
        id: 'm4',
        senderType: 'ADMIN',
        content: 'Your copy of B.S. Grewal (44th Ed.) has been verified, bubble-wrapped, and handed over to BlueDart Express under AWB #BD88921042. You will receive an SMS when it reaches the central sorting hub in Kolkata this evening.',
        timestamp: '11:20 AM',
        status: 'read',
      },
      {
        id: 'm5',
        senderType: 'CUSTOMER',
        content: 'That is really fast! Will it arrive by tomorrow afternoon at Amherst Street?',
        timestamp: '11:22 AM',
      },
    ],
  },
  {
    id: 'sess-2',
    customerName: 'Debapriya Roy',
    customerPhone: '+91 70034 56789',
    customerInitials: 'DR',
    status: 'OPEN',
    unread: false,
    orderNumber: '#TW-20261016-0812',
    profile: {
      name: 'Debapriya Roy',
      phone: '+91 70034 56789',
      accountAge: '3.8 yrs (Joined Jan 2023)',
      verified: true,
      lifetimeValue: '₹6,120',
      ordersCount: 6,
      shippingCity: 'Howrah, West Bengal (711101)',
    },
    recentOrders: [
      {
        id: 'ord-0812',
        orderNumber: '#TW-20261016-0812',
        title: 'Microelectronic Circuits - Sedra & Smith (8th Edition)',
        status: 'Delivered',
        amount: '₹1,480',
        date: 'Yesterday, 04:30 PM',
      },
      {
        id: 'ord-0610',
        orderNumber: '#TW-20260410-0610',
        title: 'Digital Signal Processing - Proakis & Manolakis',
        status: 'Delivered',
        amount: '₹1,240',
        date: '10 Apr 2026',
      },
    ],
    messages: [
      {
        id: 'm201',
        senderType: 'CUSTOMER',
        content: 'Hi team, I had asked for the courier tracking link yesterday.',
        timestamp: 'Yesterday, 06:10 PM',
      },
      {
        id: 'm202',
        senderType: 'ADMIN',
        content: 'Greetings Debapriya! Here is your India Post Speed Post tracking link: https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?consNo=EB449201992IN',
        timestamp: 'Yesterday, 06:14 PM',
        status: 'read',
      },
      {
        id: 'm203',
        senderType: 'CUSTOMER',
        content: 'Thank you so much! The tracking link works perfectly now.',
        timestamp: 'Yesterday, 06:18 PM',
      },
    ],
  },
  {
    id: 'sess-3',
    customerName: 'Dr. Anirban Mukherjee',
    customerPhone: '+91 94330 98765',
    customerInitials: 'AM',
    status: 'OPEN',
    unread: true,
    orderNumber: '#TW-20261015-0421',
    profile: {
      name: 'Dr. Anirban Mukherjee',
      phone: '+91 94330 98765',
      accountAge: '4.2 yrs (Joined Aug 2022)',
      verified: true,
      lifetimeValue: '₹18,400',
      ordersCount: 11,
      shippingCity: 'Salt Lake City, Kolkata (700064)',
    },
    recentOrders: [
      {
        id: 'ord-0421',
        orderNumber: '#TW-20261015-0421',
        title: "Harper's Illustrated Biochemistry (32nd Ed.)",
        status: 'Delivered',
        amount: '₹2,100',
        date: '15 Oct 2026',
      },
      {
        id: 'ord-0312',
        orderNumber: '#TW-20260901-0312',
        title: 'Robbins & Cotran Pathologic Basis of Disease (10th Ed.)',
        status: 'Delivered',
        amount: '₹4,350',
        date: '01 Sep 2026',
      },
    ],
    messages: [
      {
        id: 'm301',
        senderType: 'CUSTOMER',
        content: "Hello, I received my copy of Harper's Illustrated Biochemistry today. The packaging box had a dent which resulted in a minor crease on the front cover.",
        timestamp: '10:02 AM',
      },
      {
        id: 'm302',
        senderType: 'CUSTOMER',
        content: 'As this is for our department reference library, can we get a quick direct replacement under your 7-day policy?',
        timestamp: '10:04 AM',
      },
    ],
  },
  {
    id: 'sess-4',
    customerName: 'Priyanka Sengupta',
    customerPhone: '+91 82405 12345',
    customerInitials: 'PS',
    status: 'OPEN',
    unread: false,
    orderNumber: '#TW-20261017-1102',
    profile: {
      name: 'Priyanka Sengupta',
      phone: '+91 82405 12345',
      accountAge: '1 month (Joined Oct 2026)',
      verified: true,
      lifetimeValue: '₹1,620',
      ordersCount: 2,
      shippingCity: 'Siliguri, West Bengal (734001)',
    },
    recentOrders: [
      {
        id: 'ord-1102',
        orderNumber: '#TW-20261017-1102',
        title: 'Organic Chemistry - Morrison & Boyd (7th Ed.)',
        status: 'Processing',
        amount: '₹540',
        date: 'Today, 11:02 AM',
      },
    ],
    messages: [
      {
        id: 'm401',
        senderType: 'CUSTOMER',
        content: 'Hi, my payment went through on UPI but cart took a moment to update. Has order #TW-20261017-1102 been recorded?',
        timestamp: '11:05 AM',
      },
      {
        id: 'm402',
        senderType: 'ADMIN',
        content: 'Yes Priyanka! We received payment confirmation from Razorpay (pay_OPq1948). Your order is confirmed and currently being packed for dispatch.',
        timestamp: '11:08 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'sess-5',
    customerName: 'Soumyajit Das',
    customerPhone: '+91 91234 56780',
    customerInitials: 'SD',
    status: 'OPEN',
    unread: false,
    profile: {
      name: 'Soumyajit Das',
      phone: '+91 91234 56780',
      accountAge: '1.7 yrs (Joined Feb 2025)',
      verified: true,
      lifetimeValue: '₹3,450',
      ordersCount: 3,
      shippingCity: 'Burdwan, West Bengal (713101)',
    },
    recentOrders: [
      {
        id: 'ord-0311',
        orderNumber: '#TW-20260920-0311',
        title: 'GATE Computer Science & IT Topicwise Solved Papers 2026',
        status: 'Delivered',
        amount: '₹1,180',
        date: '20 Sep 2026',
      },
    ],
    messages: [
      {
        id: 'm501',
        senderType: 'CUSTOMER',
        content: 'Do you have the latest 2026 GATE CSE chapterwise question bank in stock at College Street store?',
        timestamp: '09:40 AM',
      },
      {
        id: 'm502',
        senderType: 'ADMIN',
        content: 'Yes Soumyajit! We have 14 copies physically in stock at our College Street flagship shop (90/6A MG Road). You can purchase online with home delivery or pick up directly from the counter.',
        timestamp: '09:45 AM',
        status: 'read',
      },
    ],
  },
];

export default function SupportDeskWorkspace() {
  const [sessions, setSessions] = useState<MockSessionDetail[]>(INITIAL_MOCK_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [endSessionModalOpen, setEndSessionModalOpen] = useState(false);

  // Active session lookup
  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Selecting a session clears unread flag
  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, unread: false } : s))
    );
  };

  // Sending an admin reply
  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      senderType: 'ADMIN',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === selectedSessionId) {
          return {
            ...s,
            messages: [...s.messages, newMessage],
            lastMessage: text,
            lastMessageTime: 'Just now',
          };
        }
        return s;
      })
    );

    toast.success('Reply queued & delivered via WhatsApp Business API');
  };

  // Ending a support session
  const handleConfirmEndSession = () => {
    if (!activeSession) return;
    const sessionName = activeSession.customerName;

    // Send closing automated message to mock customer feed
    const closingMessage: ChatMessageItem = {
      id: `msg-close-${Date.now()}`,
      senderType: 'ADMIN',
      content: 'Support session marked as RESOLVED by agent. Thank you for shopping with Techno World Books! This chat session is now closed.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            status: 'CLOSED',
            messages: [...s.messages, closingMessage],
          };
        }
        return s;
      })
    );

    setEndSessionModalOpen(false);
    toast.success(`Support session for ${sessionName} successfully ended.`);
  };

  // Convert sessions for sidebar item representation
  const sidebarSessionItems: SupportSessionItem[] = sessions
    .filter((s) => s.status === 'OPEN')
    .map((s) => ({
      id: s.id,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      customerInitials: s.customerInitials,
      status: s.status,
      unread: s.unread,
      lastMessage: s.messages[s.messages.length - 1]?.content || 'Session started',
      lastMessageTime: s.messages[s.messages.length - 1]?.timestamp || 'Today',
      orderNumber: s.orderNumber,
    }));

  return (
    <div className="h-[calc(100vh-6.5rem)] flex gap-4 min-w-0 overflow-hidden relative">
      {/* Pane 1: Left Sidebar (Session List) */}
      <SupportSidebar
        sessions={sidebarSessionItems}
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Pane 2: Center Window (Live Chat Feed) */}
      <ChatFeed
        customerName={activeSession.customerName}
        customerPhone={activeSession.customerPhone}
        customerInitials={activeSession.customerInitials}
        sessionStatus={activeSession.status}
        messages={activeSession.messages}
        onSendMessage={handleSendMessage}
        onEndSession={() => setEndSessionModalOpen(true)}
        orderNumber={activeSession.orderNumber}
      />

      {/* Pane 3: Right Sidebar (Customer Context) */}
      <UserContextBoard
        profile={activeSession.profile}
        recentOrders={activeSession.recentOrders}
      />

      {/* macOS Liquid Glass Destructive Confirmation Modal */}
      {endSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/80 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <PowerOff className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  End Support Session?
                </h3>
                <p className="text-xs text-stone-500">
                  Customer: <span className="font-semibold text-stone-800 dark:text-stone-200">{activeSession.customerName}</span> ({activeSession.customerPhone})
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-white/5">
              Ending this session will mark the status as <b>CLOSED</b> in the database, disconnect the live Socket.io room, and dispatch an automated completion message to the customer&apos;s WhatsApp.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEndSessionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEndSession}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Confirm End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
