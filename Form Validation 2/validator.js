function Validator(formSelector, options) {
    if (!options) {
        options = {}
    }

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {};
    var validatorRules = {
        required: function (value) {
            return value ? undefined : "Vui lòng nhập trường này";
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập đúng email";
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            };
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
            };
        }
    };

    var formElement = document.querySelector(formSelector);
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(":");

                if (isRuleHasValue) {
                    ruleInfo = rule.split(":");
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (!formRules[input.name]) {
                    formRules[input.name] = [];
                }
                formRules[input.name].push(ruleFunc);
            }

            // Listen for blur & input
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        // Validate logic
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            var formGroup = getParent(event.target, '.form-group');
            if (formGroup) {
                var formMessage = formGroup.querySelector('.form-message');
                if (errorMessage) {
                    formGroup.classList.add('invalid');
                    if (formMessage) formMessage.innerText = errorMessage;
                } else {
                    formGroup.classList.remove('invalid');
                    if (formMessage) formMessage.innerText = '';
                }
            }

            return !errorMessage;
        }

        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }

        // Handle form submit
        formElement.onsubmit = function (event) {
            event.preventDefault();

            var inputs = formElement.querySelectorAll('[name][rules]');
            var isValid = true;

            for (var input of inputs) {
                var valid = handleValidate({ target: input });
                if (!valid) {
                    isValid = false;
                }
            }

            if (isValid) {
                if (typeof options.onsubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                if (input.checked) values[input.name] = input.value;
                                break;
                            case 'checkbox':
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                if (input.checked) values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onsubmit(formValues);
                } else {
                    formElement.submit();
                }
            }
        };
    }
}
