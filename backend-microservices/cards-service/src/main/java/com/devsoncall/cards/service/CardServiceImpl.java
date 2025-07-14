package com.devsoncall.cards.service;

import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.devsoncall.cards.constants.CardsConstants;
import com.devsoncall.cards.dto.CardsDto;
import com.devsoncall.cards.entity.Cards;
import com.devsoncall.cards.exception.CardAlreadyExistsException;
import com.devsoncall.cards.exception.ResourceNotFoundException;
import com.devsoncall.cards.mapper.CardsMapper;
import com.devsoncall.cards.repository.CardsRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CardServiceImpl implements ICardsService {

	CardsRepository cardsRepo;

	@Override
	public void createCard(String mobileNumber) {
		Optional<Cards> optionalCards = cardsRepo.findByMobileNumber(mobileNumber);
		if (optionalCards.isPresent()) {
			throw new CardAlreadyExistsException("Card already exits");
		} else {
			Cards card = createNewCard(mobileNumber);
			cardsRepo.save(card);
		}
	}

	private Cards createNewCard(String mobileNumber) {
		Cards newCard = new Cards();
		long randomCardNumber = 100000000000L + new Random().nextInt(900000000);
		newCard.setCardNumber(Long.toString(randomCardNumber));
		newCard.setMobileNumber(mobileNumber);
		newCard.setCardType(CardsConstants.CREDIT_CARD);
		newCard.setTotalLimit(CardsConstants.NEW_CARD_LIMIT);
		newCard.setAmountUsed(0);
		newCard.setAvailableAmount(CardsConstants.NEW_CARD_LIMIT);
		return newCard;
	}

	@Override
	public CardsDto fetchCard(String mobileNumber) {
		Cards cards = cardsRepo.findByMobileNumber(mobileNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Card", "mobileNumber", mobileNumber));
		return CardsMapper.mapToCardsDto(cards, new CardsDto());
	}

	@Override
	public boolean updateCard(CardsDto cardsDto) {
		Cards cards = cardsRepo.findByCardNumber(cardsDto.getCardNumber())
				.orElseThrow(() -> new ResourceNotFoundException("Card", "CardNumber", cardsDto.getCardNumber()));
		CardsMapper.mapToCards(cardsDto, cards);
		cardsRepo.save(cards);
		return true;
	}

	@Override
	public boolean deleteCard(String mobileNumber) {
		Cards cards = cardsRepo.findByMobileNumber(mobileNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Card", "mobileNumber", mobileNumber));
		cardsRepo.deleteById(cards.getCardId());
		return true;
	}

}
