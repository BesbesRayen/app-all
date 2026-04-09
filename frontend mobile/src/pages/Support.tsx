import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { createSupportTicket, getSupportFaq, getSupportTickets, SupportFaq, SupportTicket } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";

const Support = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [faq, setFaq] = useState<SupportFaq[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const [faqData, ticketData] = await Promise.all([getSupportFaq(), getSupportTickets(user.userId)]);
      setFaq(faqData);
      setTickets(ticketData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible de charger support.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitQuestion = async () => {
    if (!user) {
      navigate("Login");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setErrorMessage("Entrez un sujet et votre question.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    try {
      await createSupportTicket(user.userId, { subject: subject.trim(), message: message.trim() });
      setSubject("");
      setMessage("");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Echec d'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Aide & Support</Text>
        <Text style={styles.subtitle}>Posez vos questions et consultez les reponses.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nouvelle question</Text>
          <TextInput value={subject} onChangeText={setSubject} style={styles.input} placeholder="Sujet" />
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            placeholder="Decrivez votre probleme..."
            multiline
            textAlignVertical="top"
          />
          <Pressable style={[styles.primaryButton, submitting && styles.disabled]} onPress={submitQuestion} disabled={submitting}>
            <Text style={styles.primaryText}>{submitting ? "Envoi..." : "Envoyer ma question"}</Text>
          </Pressable>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {loading && <Text style={styles.infoText}>Chargement...</Text>}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mes questions</Text>
          {tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketRow}>
              <Text style={styles.ticketTitle}>{ticket.subject}</Text>
              <Text style={styles.ticketMessage}>{ticket.message || "(Aucun detail)"}</Text>
              <Text style={styles.ticketResponse}>{ticket.response || "Reponse en attente"}</Text>
            </View>
          ))}
          {!loading && tickets.length === 0 && <Text style={styles.infoText}>Aucune question envoyee.</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {faq.map((item) => (
            <View key={item.id} style={styles.faqRow}>
              <Text style={styles.faqQ}>{item.question}</Text>
              <Text style={styles.faqA}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#f8fafc" },
  textArea: { minHeight: 96 },
  primaryButton: { backgroundColor: "#2563eb", borderRadius: 12, alignItems: "center", paddingVertical: 11 },
  primaryText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.7 },
  ticketRow: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 10, gap: 4 },
  ticketTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  ticketMessage: { fontSize: 12, color: "#334155" },
  ticketResponse: { fontSize: 11, color: "#0f766e", fontWeight: "600" },
  faqRow: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 8, gap: 4 },
  faqQ: { fontSize: 12, fontWeight: "700", color: "#0f172a" },
  faqA: { fontSize: 12, color: "#475569" },
  infoText: { fontSize: 12, color: "#64748b" },
  errorText: { fontSize: 12, color: "#dc2626" },
});

export default Support;
