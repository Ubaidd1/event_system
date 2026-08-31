const Invitation = require('../models/Invitation');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const CheckIn = require('../models/CheckIn');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyQRToken = asyncHandler(async (req, res) => {
  const { token, eventId } = req.body;

  if (!token) {
    throw new ApiError(400, 'QR Token is required');
  }

  // Find invitation by secureToken with populated guest, family, and event
  const invitation = await Invitation.findOne({ secureToken: token })
    .populate('guest')
    .populate('family')
    .populate('event');

  if (!invitation) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          valid: false,
          status: 'INVALID',
          message: 'Invalid QR Code. This invitation pass token could not be verified in the system.'
        },
        'QR verification processed'
      )
    );
  }

  // Target scanner event
  let scannerEvent = null;
  if (eventId) {
    scannerEvent = await Event.findById(eventId);
  } else if (invitation.event) {
    scannerEvent = invitation.event;
  } else {
    scannerEvent = await Event.findOne({ wedding: invitation.wedding }).sort({ date: 1 });
  }

  if (!scannerEvent) {
    throw new ApiError(404, 'No valid event found for verification');
  }

  // ENFORCE EVENT-SPECIFIC QR PASS MATCHING:
  // If the QR pass was issued for a specific event and scanner is set to another event:
  if (invitation.event && scannerEvent._id.toString() !== invitation.event._id.toString()) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          valid: false,
          status: 'EVENT_MISMATCH',
          message: `QR Pass Mismatch! This pass was issued specifically for '${invitation.event.name}' and cannot be used for '${scannerEvent.name}'.`,
          passEvent: {
            id: invitation.event._id,
            name: invitation.event.name
          },
          scannerEvent: {
            id: scannerEvent._id,
            name: scannerEvent.name
          },
          invitation: {
            token: invitation.secureToken,
            guestName: invitation.guest?.name || invitation.family?.name || 'Guest',
            category: invitation.guest?.category || 'VIP'
          }
        },
        'QR verification processed'
      )
    );
  }

  // Check if ALREADY checked in for this specific event
  const existingCheckIn = await CheckIn.findOne({
    invitation: invitation._id,
    event: event._id
  }).populate('scannedBy', 'name');

  if (existingCheckIn) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          valid: false,
          status: 'DUPLICATE',
          message: 'Already Checked In. This invitation has already been used for this event.',
          checkInDetails: {
            scannedAt: existingCheckIn.scannedAt,
            scannedBy: existingCheckIn.scannedBy?.name || 'Staff',
            attendeesCount: existingCheckIn.attendeesCount
          },
          invitation: {
            id: invitation._id,
            token: invitation.secureToken,
            guestName: invitation.guest?.name || invitation.family?.name || 'Guest',
            family: invitation.family?.name || '',
            category: invitation.guest?.category || 'VIP',
            allowedPlusOnes: (invitation.guest?.allowedPlusOnes || 0) + 1
          },
          event: {
            id: event._id,
            name: event.name
          }
        },
        'QR verification processed'
      )
    );
  }

  // Calculate invited count (1 primary + plusOnes)
  let familyMembersCount = 0;
  if (invitation.family) {
    familyMembersCount = await Guest.countDocuments({ family: invitation.family._id });
  }

  const totalAllowedAttendees = invitation.family
    ? (familyMembersCount || 4)
    : ((invitation.guest?.allowedPlusOnes || 0) + 1);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        status: 'VALID',
        message: 'Valid Invitation Verified',
        invitation: {
          id: invitation._id,
          token: invitation.secureToken,
          guestId: invitation.guest?._id || null,
          familyId: invitation.family?._id || null,
          guestName: invitation.guest?.name || invitation.family?.name || 'Guest',
          family: invitation.family?.name || '',
          category: invitation.guest?.category || 'VIP',
          rsvpStatus: invitation.guest?.rsvpStatus || 'Confirmed',
          allowedAttendees: totalAllowedAttendees
        },
        event: {
          id: event._id,
          name: event.name,
          venue: event.venue
        }
      },
      'QR verification processed'
    )
  );
});

module.exports = {
  verifyQRToken
};
