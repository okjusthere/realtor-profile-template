import { describe, it, expect } from "vitest";
import { generateContactNotificationEmail, generateConfirmationEmail } from "./_core/emailService";

describe("Email Service", () => {
  describe("generateContactNotificationEmail", () => {
    it("should generate valid HTML for notification email", () => {
      const html = generateContactNotificationEmail(
        "John Doe",
        "john@example.com",
        "555-1234",
        "Property Inquiry",
        "I'm interested in the property at 123 Main St",
        "Heidi"
      );

      expect(html).toContain("New Contact Form Submission");
      expect(html).toContain("John Doe");
      expect(html).toContain("john@example.com");
      expect(html).toContain("555-1234");
      expect(html).toContain("Property Inquiry");
      // Single quote is escaped as &#039;
      expect(html).toContain("interested in the property at 123 Main St");
      expect(html).toContain("Heidi");
    });

    it("should handle special characters in sender name", () => {
      const html = generateContactNotificationEmail(
        "John & Jane <Doe>",
        "john@example.com",
        null,
        "Test",
        "Test message",
        "Heidi"
      );

      expect(html).toContain("&amp;");
      expect(html).toContain("&lt;");
      expect(html).toContain("&gt;");
    });

    it("should handle null phone number", () => {
      const html = generateContactNotificationEmail(
        "John Doe",
        "john@example.com",
        null,
        "Test",
        "Test message",
        "Heidi"
      );

      expect(html).not.toContain("<strong>Phone:</strong>");
    });

    it("should escape HTML in message content", () => {
      const html = generateContactNotificationEmail(
        "John Doe",
        "john@example.com",
        null,
        "Test",
        "<script>alert('xss')</script>",
        "Heidi"
      );

      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&lt;/script&gt;");
      expect(html).not.toContain("<script>");
    });
  });

  describe("generateConfirmationEmail", () => {
    it("should generate valid HTML for confirmation email", () => {
      const html = generateConfirmationEmail("John Doe", "Heidi");

      expect(html).toContain("Thank You for Contacting Us");
      expect(html).toContain("John Doe");
      expect(html).toContain("Heidi");
      expect(html).toContain("received your message");
    });

    it("should handle special characters in sender name", () => {
      const html = generateConfirmationEmail("John & Jane", "Heidi");

      expect(html).toContain("&amp;");
      expect(html).toContain("Heidi");
    });

    it("should include team member name", () => {
      const html = generateConfirmationEmail("Test User", "Heidi");

      expect(html).toContain("Heidi");
    });
  });

  describe("Email content validation", () => {
    it("should produce valid HTML structure", () => {
      const html = generateContactNotificationEmail(
        "Test User",
        "test@example.com",
        "555-1234",
        "Test Subject",
        "Test message content",
        "Heidi"
      );

      // Check for proper HTML structure
      expect(html).toMatch(/<div[^>]*>/);
      expect(html).toMatch(/<\/div>/);
      expect(html).toMatch(/<h[2-3]/);
      expect(html).toMatch(/<p/);
    });

    it("should include proper email styling", () => {
      const html = generateConfirmationEmail("Test User", "Heidi");

      expect(html).toContain("style=");
      expect(html).toContain("font-family");
      expect(html).toContain("max-width");
    });

    it("should include clickable email link in notification", () => {
      const html = generateContactNotificationEmail(
        "Test User",
        "test@example.com",
        null,
        "Test",
        "Test",
        "Heidi"
      );

      expect(html).toContain("mailto:test@example.com");
      expect(html).toContain("test@example.com");
    });

    it("should include Homix branding in footer", () => {
      const html1 = generateContactNotificationEmail(
        "Test",
        "test@example.com",
        null,
        "Test",
        "Test",
        "Heidi"
      );
      const html2 = generateConfirmationEmail("Test", "Heidi");

      expect(html1).toContain("Homix Realty Inc");
      expect(html2).toContain("Homix Realty Inc");
    });
  });
});
