/**
 * Bounding box coordinates for extracted fields on a document page.
 * All coordinates are in pixels at 100% zoom (72 DPI).
 * Document dimensions at 100%: 612px x 792px (8.5" x 11" letter)
 */
export interface BoundingBox {
  /** Pixels from left edge at 100% zoom */
  x: number;
  /** Pixels from top edge at 100% zoom */
  y: number;
  /** Width in pixels at 100% zoom */
  width: number;
  /** Height in pixels at 100% zoom */
  height: number;
}

/**
 * Types of fields that can be extracted from a document
 */
export type ExtractedFieldType =
  | "patient-name"
  | "patient-dob"
  | "patient-phn"
  | "patient-phone"
  | "document-type"
  | "completeness-item"
  | "physician-name"
  | "physician-fax";

/**
 * An extracted field from a document page with its location information
 */
export interface ExtractedField {
  /** Unique identifier for this field */
  id: string;
  /** Type of field extracted */
  fieldType: ExtractedFieldType;
  /** Human-readable label */
  label: string;
  /** The extracted value */
  value: string;
  /** Location on the page */
  boundingBox: BoundingBox;
  /** Page number (1-indexed) where the field was found */
  pageNumber: number;
  /** AI confidence score 0-100 */
  confidence: number;
}
