"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  privacyAgreement: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("/api/admin/contacts");
        const data = await res.json();
        if (Array.isArray(data)) setContacts(data);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
      setLoading(false);
    }
    fetchContacts();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">{contacts.length} submissions total</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No contact submissions yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(contact.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{contact.phone}</span>
                    </span>
                    {contact.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{contact.email}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                    {contact.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
