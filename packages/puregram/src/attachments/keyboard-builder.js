class KeyboardBuilder {
  constructor() {
    this.isOneTime = false;
    this.isResize = false;
    this.isSelective = false;
    this.rows = [];
    this.currentRow = [];
  }

	get [Symbol.toStringTag]() {
		return 'KeyboardBuilder';
	}

	textButton(text) {
		return this.addButton({
      text,
		});
	}

	locationRequestButton(text) {
		return this.addWideButton({
      text: encodeURI(text),
      request_location: true,
		});
	}
	
	pollRequestButton(text, type) {
		return this.addWideButton({
			text: encodeURI(text),
			request_poll: { type },
		});
	}
  
  contactRequestButton(text) {
		return this.addWideButton({
      text: encodeURI(text),
      request_contact: true,
		});
	}

	row() {
		if (this.currentRow.length === 0) {
			return this;
		}

		this.rows.push(this.currentRow);

		this.currentRow = [];

		return this;
	}

	oneTime(enabled = true) {
		this.isOneTime = enabled;

		return this;
  }
  
  resize(enabled = true) {
		this.isResize = enabled;

		return this;
  }
  
  selective(enabled = true) {
		this.isSelective = enabled;

		return this;
	}

	addButton(button) {
		this.currentRow.push(button);

		return this;
	}

	addWideButton(button) {
		if (this.currentRow.length !== 0) {
			this.row();
		}

		this.addButton(button);

		return this.row();
	}

	toJSON() {
		let buttons = this.currentRow.length !== 0
			? [...this.rows, this.currentRow]
      : this.rows;
      
    let { isResize, isOneTime, isSelective } = this;

		return JSON.stringify({
      keyboard: buttons,
      resize_keyboard: isResize,
      one_time_keyboard: isOneTime,
      selective: isSelective,
    });
	}
}

module.exports = KeyboardBuilder;
