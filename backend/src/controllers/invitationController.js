const Invitation = require('../models/Invitation');
const Guest = require('../models/Guest');
const Family = require('../models/Family');
const Wedding = require('../models/Wedding');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateQRCodeDataURL, generateSecureToken } = require('../utils/qrCodeGenerator');

const getInvitations = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();
  const invitations = await Invitation.find({ wedding: wedding._id })
    .populate('guest', 'name email category rsvpStatus')
    .populate('family', 'name headContact')
    .populate('event', 'name date venue')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, invitations, 'Invitations retrieved successfully'));
});

const createInvitation = asyncHandler(async (req, res) => {
  const { guestId, familyId, eventId, templateStyle, title, customMessage, posterUrl } = req.body;
  const wedding = await Wedding.findOne();

  if (!guestId && !familyId) {
    throw new ApiError(400, 'Either guestId or familyId is required for an invitation');
  }

  // Determine target event
  let targetEventId = eventId;
  if (!targetEventId) {
    if (guestId) {
      const guestObj = await Guest.findById(guestId);
      if (guestObj && guestObj.events && guestObj.events.length > 0) {
        targetEventId = guestObj.events[0];
      }
    }
    if (!targetEventId) {
      const firstEvent = await Event.findOne({ wedding: wedding._id }).sort({ date: 1 });
      if (firstEvent) targetEventId = firstEvent._id;
    }
  }

  if (!targetEventId) {
    throw new ApiError(400, 'An event must exist to create an event-specific QR pass');
  }

  // Check if invitation already exists for this (guest/family + event) combination
  const query = { wedding: wedding._id, event: targetEventId };
  if (guestId) query.guest = guestId;
  if (familyId) query.family = familyId;

  let invitation = await Invitation.findOne(query);

  const secureToken = generateSecureToken();
  const qrCodeUrl = await generateQRCodeDataURL(secureToken);

  if (invitation) {
    invitation.templateStyle = templateStyle || invitation.templateStyle;
    invitation.title = title || invitation.title;
    invitation.customMessage = customMessage || invitation.customMessage;
    if (posterUrl) invitation.posterUrl = posterUrl;
    invitation.qrCodeUrl = qrCodeUrl;
    await invitation.save();
  } else {
    invitation = await Invitation.create({
      wedding: wedding._id,
      guest: guestId || null,
      family: familyId || null,
      event: targetEventId,
      secureToken,
      templateStyle: templateStyle || 'Royal Gold',
      title: title || 'Wedding Celebration Invitation',
      customMessage: customMessage || 'We request the pleasure of your company to celebrate our wedding.',
      posterUrl: posterUrl || '',
      qrCodeUrl
    });
  }

  const populated = await Invitation.findById(invitation._id)
    .populate('guest', 'name email category rsvpStatus')
    .populate('family', 'name headContact')
    .populate('event', 'name date venue');

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Generated Event Pass',
    entityType: 'Invitation',
    details: `${req.user.name} generated event pass ${invitation.secureToken} for event '${populated.event?.name}'`
  });

  return res.status(201).json(new ApiResponse(201, populated, 'Event-specific invitation generated successfully'));
});

const getPublicInvitationByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const invitation = await Invitation.findOne({ secureToken: token })
    .populate('guest', 'name category allowedPlusOnes plusOnesAssigned rsvpStatus events')
    .populate('family', 'name headContact')
    .populate('event', 'name date startTime endTime venue address description dressCode');

  if (!invitation) {
    throw new ApiError(404, 'Invalid or expired invitation token');
  }

  // Track view stats
  invitation.viewCount += 1;
  invitation.lastViewedAt = new Date();
  await invitation.save();

  const wedding = await Wedding.findById(invitation.wedding).select('coupleNames title weddingDate coverImage currency');

  // Fetch target event details
  let targetEvent = invitation.event;
  if (!targetEvent) {
    targetEvent = await Event.findOne({ wedding: wedding._id }).select('name date startTime endTime venue address description dressCode');
  }

  // Fetch family members if family invitation
  let familyMembers = [];
  if (invitation.family) {
    familyMembers = await Guest.find({ family: invitation.family._id }).select('name rsvpStatus');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token: invitation.secureToken,
        templateStyle: invitation.templateStyle,
        title: invitation.title,
        customMessage: invitation.customMessage,
        posterUrl: invitation.posterUrl,
        qrCodeUrl: invitation.qrCodeUrl,
        wedding,
        guestName: invitation.guest?.name || invitation.family?.name || 'Honored Guest',
        category: invitation.guest?.category || 'VIP Guest',
        rsvpStatus: invitation.guest?.rsvpStatus || 'Pending',
        allowedPlusOnes: invitation.guest?.allowedPlusOnes || 1,
        plusOnesAssigned: invitation.guest?.plusOnesAssigned || 0,
        event: targetEvent,
        events: targetEvent ? [targetEvent] : [],
        familyMembers
      },
      'Public invitation retrieved'
    )
  );
});

const submitPublicRSVP = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { rsvpStatus, plusOnesAssigned, notes } = req.body;

  if (!['Confirmed', 'Declined'].includes(rsvpStatus)) {
    throw new ApiError(400, 'Invalid RSVP status');
  }

  const invitation = await Invitation.findOne({ secureToken: token }).populate('guest');
  if (!invitation) {
    throw new ApiError(404, 'Invitation not found');
  }

  if (invitation.guest) {
    invitation.guest.rsvpStatus = rsvpStatus;
    invitation.guest.rsvpDate = new Date();
    if (plusOnesAssigned !== undefined) {
      invitation.guest.plusOnesAssigned = Math.min(plusOnesAssigned, invitation.guest.allowedPlusOnes);
    }
    if (notes) invitation.guest.notes = notes;
    await invitation.guest.save();
  }

  await ActivityLog.create({
    wedding: invitation.wedding,
    action: 'RSVP Submitted',
    entityType: 'RSVP',
    details: `Guest ${invitation.guest?.name || token} set RSVP to ${rsvpStatus}`
  });

  return res.status(200).json(new ApiResponse(200, {}, `RSVP updated to ${rsvpStatus}`));
});

const deleteInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) {
    throw new ApiError(404, 'Invitation not found');
  }
  await invitation.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, 'Invitation deleted'));
});

module.exports = {
  getInvitations,
  createInvitation,
  getPublicInvitationByToken,
  submitPublicRSVP,
  deleteInvitation
};
