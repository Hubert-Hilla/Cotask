// components/dashboard/contacts/ContactsPage.tsx
'use client';

import { useState } from 'react';

interface ContactsPageProps {
  user: {
    username: string;
    id: string;
  };
  contacts: Contact[];
  onBack: () => void;
  onAddContact: (username: string) => void;
  onAcceptRequest: (contactId: string) => void;
  onRejectRequest: (contactId: string) => void;
  onRemoveContact: (contactId: string) => void;
}

// types/contacts.ts
export interface Contact {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  relationship_id: string;
  status: 'friend' | 'pending-sent' | 'pending-received' | 'blocked';
}

export default function ContactsPageComponent({ 
  user,
  contacts, 
  onBack, 
  onAddContact,
  onAcceptRequest,
  onRejectRequest,
  onRemoveContact
}: ContactsPageProps) {
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const handleAddContact = () => {
    if (!searchUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    
    if (searchUsername === user.username) {
      alert('You cannot add yourself!');
      return;
    }

    onAddContact(searchUsername.trim());
    setSearchUsername('');
  };

  const toggleDropdown = (id: string) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const acceptedContacts = contacts.filter(c => c.status === 'friend');
  const pendingReceived = contacts.filter(c => c.status === 'pending-received');
  const pendingSent = contacts.filter(c => c.status === 'pending-sent');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold">Contacts</h1>
              <p className="text-sm text-gray-500">
                Manage your connections
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add Contact Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add New Contact
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Search for users by their username to send a connection request
            </p>
          </div>
          <div className="p-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                onClick={handleAddContact}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Tabs */}
        <div className="space-y-4">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 ${activeTab === 'contacts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
              </svg>
              Contacts
              {acceptedContacts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {acceptedContacts.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Requests
              {pendingReceived.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingReceived.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 ${activeTab === 'sent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Sent
              {pendingSent.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {pendingSent.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {/* Accepted Contacts */}
            {activeTab === 'contacts' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">My Contacts</h2>
                  <p className="text-sm text-gray-500">
                    People you're connected with
                  </p>
                </div>
                <div className="p-6">
                  {acceptedContacts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg mb-2">No contacts yet</h3>
                      <p className="text-gray-500">
                        Add your first contact to start collaborating
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {acceptedContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(contact.name)
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-gray-500">
                                @{contact.username}
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown(contact.id)}
                              className="p-2 rounded-lg hover:bg-gray-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            
                            {dropdownOpenId === contact.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg">
                                  View Profile
                                </button>
                                <button 
                                  onClick={() => {
                                    onRemoveContact(contact.id);
                                    setDropdownOpenId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 last:rounded-b-lg"
                                >
                                  Remove Contact
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Requests (Received) */}
            {activeTab === 'requests' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Pending Requests</h2>
                  <p className="text-sm text-gray-500">
                    People who want to connect with you
                  </p>
                </div>
                <div className="p-6">
                  {pendingReceived.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg mb-2">No pending requests</h3>
                      <p className="text-gray-500">
                        You'll see connection requests here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReceived.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(contact.name)
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-gray-500">
                                @{contact.username}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => onAcceptRequest(contact.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                            >
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() => onRejectRequest(contact.id)}
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                            >
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Requests (Sent) */}
            {activeTab === 'sent' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Sent Requests</h2>
                  <p className="text-sm text-gray-500">
                    Waiting for acceptance
                  </p>
                </div>
                <div className="p-6">
                  {pendingSent.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg mb-2">No sent requests</h3>
                      <p className="text-gray-500">
                        Requests you send will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingSent.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(contact.name)
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-gray-500">
                                @{contact.username}
                              </div>
                            </div>
                          </div>

                          <span className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-sm">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}